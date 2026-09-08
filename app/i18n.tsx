import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import en from '../locales/en.json';

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

/** ka.json lands in phase 3; until then ka resolves to the en bundle (per-key fallback below also applies). */
const bundles:Record<Locale,Messages>={en,ka:en};
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
