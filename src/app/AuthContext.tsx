import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
type AppUser={id?:string;email:string};
type AuthValue={user:AppUser|null;loading:boolean;signInWithMagicLink:(email:string)=>Promise<void>;signInWithGoogle:()=>Promise<void>;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
  const[loading,setLoading]=useState(hasSupabaseConfig);
  const[user,setUser]=useState<AppUser|null>(()=>{if(hasSupabaseConfig)return null;const email=localStorage.getItem('travel-demo-user');return email?{email}:null});
  useEffect(()=>{if(!supabase)return;void supabase.auth.getSession().then(({data})=>{const u=data.session?.user;setUser(u?.email?{id:u.id,email:u.email}:null);setLoading(false)});const{data}=supabase.auth.onAuthStateChange((_event,session)=>{const u=session?.user;setUser(u?.email?{id:u.id,email:u.email}:null);setLoading(false)});return()=>data.subscription.unsubscribe()},[]);
  const value=useMemo<AuthValue>(()=>({user,loading,async signInWithMagicLink(email){if(supabase){const{error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${window.location.origin}/trips`}});if(error)throw error;return}localStorage.setItem('travel-demo-user',email);setUser({email})},async signInWithGoogle(){if(supabase){const{error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/trips`}});if(error)throw error;return}localStorage.setItem('travel-demo-user','demo@example.com');setUser({email:'demo@example.com'})},async signOut(){if(supabase)await supabase.auth.signOut();localStorage.removeItem('travel-demo-user');setUser(null)}}),[loading,user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider is required');return value}
