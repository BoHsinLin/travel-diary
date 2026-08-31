import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../app/AuthContext';
import { magicLinkSchema } from '../../contracts/schemas';
import { hasSupabaseConfig } from '../../lib/supabase';
import './auth.css';
type FormValue=z.infer<typeof magicLinkSchema>;
export function LoginPage(){
  const{signInWithMagicLink,signInWithGoogle}=useAuth();const navigate=useNavigate();const location=useLocation();const[message,setMessage]=useState('');
  const{register,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormValue>({resolver:zodResolver(magicLinkSchema)});
  const submit=async({email}:FormValue)=>{await signInWithMagicLink(email);setMessage('登入連結已寄出，請到信箱完成登入。');if(!hasSupabaseConfig)navigate((location.state as{from?:string}|null)?.from??'/trips',{replace:true})};
  return <main className="auth-page"><section className="auth-shell"><header className="auth-brand"><h1>旅程誌</h1><p>一起把旅行，排成喜歡的樣子。</p><small>私人邀請制 · 旅伴共同編輯</small></header><div className="auth-form"><h2>登入你的旅程</h2><p>使用 Google 或 Email Magic Link 繼續</p>{message&&<p role="status">{message}</p>}<button className="google-login" onClick={()=>void signInWithGoogle().then(()=>{if(!hasSupabaseConfig)navigate('/trips')})}>使用 Google 繼續</button><div className="auth-divider">或使用 Email</div><form onSubmit={handleSubmit(submit)} noValidate><label htmlFor="email"><span>Email</span><input id="email" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={Boolean(errors.email)} {...register('email')}/></label>{errors.email&&<small role="alert">{errors.email.message}</small>}<button disabled={isSubmitting}>{isSubmitting?'正在寄送…':'寄送登入連結'}</button></form><aside><strong>收到旅伴邀請？</strong><span>登入後會自動加入受邀旅程；公開連結僅提供唯讀內容。</span></aside><small className="terms">繼續即表示同意服務條款與隱私政策</small></div></section></main>;
}
