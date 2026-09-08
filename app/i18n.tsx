import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import en from '../locales/en.json';
import ka from '../locales/ka.json';
import anatomyKa from '../locales/anatomy.ka.json';

export type Locale='en'|'ka';
export type Messages=typeof en;
type Paths<T>={[K in keyof T&string]:T[K] extends string?K:`${K}.${Paths<T[K]>}`}[keyof T&string];
export type MessageKey=Paths<Messages>;
export type MessageVars=Record<string,string|number>;

export const STORAGE_KEY='human-atlas-locale';
export const LOCALES:Locale[]=['en','ka'];

function detect():Locale{
 if(typeof window==='undefined')return 'en';
 try{
  const stored=window.localStorage.getItem(STORAGE_KEY);
  if(stored==='en'||stored==='ka')return stored;
 }catch{}
 return typeof navigator!=='undefined'&&navigator.language?.toLowerCase().startsWith('ka')?'ka':'en';
}

/** ka.json provides the Georgian bundle; per-key fallback to en below covers any gaps. */
const bundles:Record<Locale,Messages>={en,ka};
let currentLocale:Locale=detect();

function lookup(bundle:Messages,key:string):string|undefined{
 let node:unknown=bundle;
 for(const part of key.split('.')){
  if(typeof node!=='object'||node===null)return undefined;
  node=(node as Record<string,unknown>)[part];
 }
 return typeof node==='string'?node:undefined;
}

/** ICU-lite: {var} substitution plus the single {n, plural, one {…} other {…}} form. */
export function format(message:string,vars?:MessageVars):string{
 let out=message.replace(/\{(\w+), plural, one \{([^{}]*)\} other \{([^{}]*)\}\}/g,(match,name,one,other)=>{
  const value=Number(vars?.[name]);
  if(Number.isNaN(value))return match;
  return value===1?one:other;
 });
 if(vars)out=out.replace(/\{(\w+)\}/g,(match,name)=>name in vars?String(vars[name]):match);
 return out;
}

/** Non-hook translator for module-level code paths (scene effects, model download). */
export function translate(key:MessageKey,vars?:MessageVars):string{
 const message=lookup(bundles[currentLocale],key)??lookup(en,key)??key;
 return format(message,vars);
}

/** Anatomy overlay: Georgian part names keyed by FJ part id (locales/anatomy.ka.json). atlas.json stays the source of truth; unmapped ids fall back to the English name. */
export const ANATOMY_OVERLAY:Record<string,string>=anatomyKa;

/** Non-hook anatomy name resolver (scene hover etc.): ka overlay when locale is ka, English otherwise. */
export function anatomyName(partId:string,enName:string):string{
 return currentLocale==='ka'?(ANATOMY_OVERLAY[partId]??enName):enName;
}

interface I18nValue{locale:Locale;setLocale:(next:Locale)=>void;t:(key:MessageKey,vars?:MessageVars)=>string}
const I18nContext=createContext<I18nValue>({locale:currentLocale,setLocale:()=>{},t:translate});

export function LocaleProvider({children}:{children:ReactNode}){
 const [locale,setLocaleState]=useState<Locale>(currentLocale);
 const setLocale=useCallback((next:Locale)=>{
  currentLocale=next;
  try{window.localStorage.setItem(STORAGE_KEY,next);}catch{}
  setLocaleState(next);
 },[]);
 useEffect(()=>{document.documentElement.lang=locale;},[locale]);
 const t=useCallback((key:MessageKey,vars?:MessageVars)=>translate(key,vars),[locale]);
 return <I18nContext.Provider value={{locale,setLocale,t}}>{children}</I18nContext.Provider>;
}

export function useT(){return useContext(I18nContext);}

/** Hook anatomy name resolver: re-renders on locale change, ka overlay with English fallback. */
export function useAnatomyName(){
 const {locale}=useT();
 return useCallback((partId:string,enName:string)=>locale==='ka'?(ANATOMY_OVERLAY[partId]??enName):enName,[locale]);
}
