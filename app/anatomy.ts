import {translate,type MessageKey} from './i18n';
export type SystemId = 'skeletal'|'muscular'|'arterial'|'venous'|'nervous'|'digestive'|'respiratory'|'urinary'|'reproductive'|'lymphatic'|'endocrine'|'integumentary'|'connective'|'sensory'|'cardiac';
const SYSTEM_META: {id:SystemId;color:string}[] = [
 {id:'skeletal',color:'#e2d9ba'},
 {id:'muscular',color:'#a85b50'},
 {id:'cardiac',color:'#b96760'},
 {id:'sensory',color:'#b0c8ce'},
 {id:'arterial',color:'#c05245'},
 {id:'venous',color:'#527c9f'},
 {id:'nervous',color:'#d8b565'},
 {id:'respiratory',color:'#b98991'},
 {id:'digestive',color:'#b8916b'},
 {id:'urinary',color:'#b47961'},
 {id:'lymphatic',color:'#879f7c'},
 {id:'endocrine',color:'#c5a09a'},
 {id:'reproductive',color:'#bda098'},
 {id:'integumentary',color:'#ba9b7d'},
 {id:'connective',color:'#aec3bb'},
];
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = SYSTEM_META.map(m=>({id:m.id,color:m.color,name:translate(`systems.${m.id}.name`),description:translate(`systems.${m.id}.description`)}));
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'front'|'back'|'side';
export interface SceneState {inspectorOpen?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[] = ['cardiac','sensory','skeletal','muscular','arterial','venous','nervous','respiratory','digestive','urinary','lymphatic','endocrine','reproductive','connective'];
export const EXPLANATION_KEYS = ['heart','liver','brain','stomach','spleen','pancreas','urinary bladder','trachea','diaphragm'] as const;
export const EXPLANATIONS:Record<string,string> = Object.fromEntries(EXPLANATION_KEYS.map(k=>[k,translate(`explanations.${k}` as MessageKey)]));
export function explanation(name:string,system:SystemId){const key=name.toLowerCase();if((EXPLANATION_KEYS as readonly string[]).includes(key))return translate(`explanations.${key}` as MessageKey);return translate(`systems.${system}.description`);}
