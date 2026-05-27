import{u as K,a3 as i,X as O,W as G,j as y,a2 as M,l as J,L as Y,S as Z,Z as A,p as T,m,U as V,a6 as Q,ah as ee,A as te,Y as ae,s as ne,am as se,ad as oe,F as le,a5 as re,ab as R,an as X,ai as j,ao as ue,V as P,k as F,a9 as ie,C as de,ag as ce,N as ve,o as me,_ as fe}from"./index-BjszlqGz.js";var q=K({name:"vue3-danmaku",components:{},props:{danmus:{type:Array,required:!0,default:()=>[]},channels:{type:Number,default:0},autoplay:{type:Boolean,default:!0},loop:{type:Boolean,default:!1},useSlot:{type:Boolean,default:!1},debounce:{type:Number,default:100},speeds:{type:Number,default:200},randomChannel:{type:Boolean,default:!1},fontSize:{type:Number,default:18},top:{type:Number,default:4},right:{type:Number,default:0},isSuspend:{type:Boolean,default:!1},extraStyle:{type:String,default:""}},emits:["list-end","play-end","dm-over","dm-out","update:danmus"],setup(u,{emit:f,slots:C}){let c=i(document.createElement("div")),o=i(document.createElement("div"));const d=i(0),E=i(0);let N=0;const B=i(0),I=i(0),x=i(0),w=i(!1),b=i(!1),S=i({}),v=(function(n,l,e="modelValue",t){return y({get:()=>n[e],set:k=>{l(`update:${e}`,k)}})})(u,f,"danmus"),p=M({channels:y((()=>u.channels||B.value)),autoplay:y((()=>u.autoplay)),loop:y((()=>u.loop)),useSlot:y((()=>u.useSlot)),debounce:y((()=>u.debounce)),randomChannel:y((()=>u.randomChannel))}),g=M({height:y((()=>I.value)),fontSize:y((()=>u.fontSize)),speeds:y((()=>u.speeds)),top:y((()=>u.top)),right:y((()=>u.right))});function U(){$(),u.isSuspend&&(function(){let n=[];o.value.addEventListener("mouseover",(l=>{let e=l.target;e.className.includes("dm")||(e=e.closest(".dm")||e),e.className.includes("dm")&&(n.includes(e)||(f("dm-over",{el:e}),e.classList.add("pause"),n.push(e)))})),o.value.addEventListener("mouseout",(l=>{let e=l.target;e.className.includes("dm")||(e=e.closest(".dm")||e),e.className.includes("dm")&&(f("dm-out",{el:e}),e.classList.remove("pause"),n.forEach((t=>{t.classList.remove("pause")})),n=[])}))})(),p.autoplay&&W()}function $(){if(d.value=c.value.offsetWidth,E.value=c.value.offsetHeight,d.value===0||E.value===0)throw new Error("获取不到容器宽高")}function W(){b.value=!1,N||(N=window.setInterval((()=>(function(){if(!b.value&&v.value.length)if(x.value>v.value.length-1){const n=o.value.children.length;p.loop&&(n<x.value&&(f("list-end"),x.value=0),s())}else s()})()),p.debounce))}function s(n){const l=p.loop?x.value%v.value.length:x.value,e=n||v.value[l];let t=document.createElement("div");p.useSlot?t=(function(k,h){return J({render:()=>Y("div",{},[C.dm&&C.dm({danmu:k,index:h})])}).mount(document.createElement("div"))})(e,l).$el:(t.innerHTML=e,t.setAttribute("style",u.extraStyle),t.style.fontSize=`${g.fontSize}px`,t.style.lineHeight=`${g.fontSize}px`),t.classList.add("dm"),o.value.appendChild(t),t.style.opacity="0",Z((()=>{g.height||(I.value=t.offsetHeight),p.channels||(B.value=Math.floor(E.value/(g.height+g.top)));let k=(function(h){let _=[...Array(p.channels).keys()];p.randomChannel&&(_=_.sort((()=>.5-Math.random())));for(let L of _){const D=S.value[L];if(!D||!D.length)return S.value[L]=[h],h.addEventListener("animationend",(()=>S.value[L].splice(0,1))),L%p.channels;for(let z=0;z<D.length;z++){const H=r(D[z])-10;if(H<=.88*(h.offsetWidth-D[z].offsetWidth)||H<=0)break;if(z===D.length-1)return S.value[L].push(h),h.addEventListener("animationend",(()=>S.value[L].splice(0,1))),L%p.channels}}return-1})(t);if(k>=0){const h=t.offsetWidth,_=g.height;t.classList.add("move"),t.dataset.index=`${l}`,t.dataset.channel=k.toString(),t.style.opacity="1",t.style.top=k*(_+g.top)+"px",t.style.width=h+g.right+"px",t.style.setProperty("--dm-scroll-width",`-${d.value+h}px`),t.style.left=`${d.value}px`,t.style.animationDuration=d.value/g.speeds+"s",t.addEventListener("animationend",(()=>{Number(t.dataset.index)!==v.value.length-1||p.loop||f("play-end",t.dataset.index),o.value&&o.value.removeChild(t)})),x.value++}else o.value.removeChild(t)}))}function r(n){const l=n.offsetWidth||parseInt(n.style.width),e=n.getBoundingClientRect().right||o.value.getBoundingClientRect().right+l;return o.value.getBoundingClientRect().right-e}function a(){clearInterval(N),N=0,x.value=0}return O((()=>{console.error("%c [vue3-danmaku] ⚠️ DEPRECATION WARNING","background: #ffcc00; color: #000; padding: 2px 4px; border-radius: 3px; font-weight: bold;",`
该包已停止维护，请迁移至新版官方库: "vue-danmaku"。
This package is deprecated. Please migrate to "vue-danmaku".`),U()})),G((()=>{a()})),{container:c,dmContainer:o,hidden:w,paused:b,danmuList:v,getPlayState:function(){return!b.value},resize:function(){$();const n=o.value.getElementsByClassName("dm");for(let l=0;l<n.length;l++){const e=n[l];e.style.setProperty("--dm-scroll-width",`-${d.value+e.offsetWidth}px`),e.style.left=`${d.value}px`,e.style.animationDuration=d.value/g.speeds+"s"}},play:W,pause:function(){b.value=!0},stop:function(){S.value={},o.value.innerHTML="",b.value=!0,w.value=!1,a()},show:function(){w.value=!1},hide:function(){w.value=!0},reset:function(){I.value=0,U()},add:function(n){if(x.value===v.value.length)return v.value.push(n),v.value.length-1;{const l=x.value%v.value.length;return v.value.splice(l,0,n),l+1}},push:function(n){return v.value.push(n),v.value.length-1},insert:s}}});const pe={ref:"container",class:"vue-danmaku"};(function(u,f){f===void 0&&(f={});var C=f.insertAt;if(typeof document<"u"){var c=document.head||document.getElementsByTagName("head")[0],o=document.createElement("style");o.type="text/css",C==="top"&&c.firstChild?c.insertBefore(o,c.firstChild):c.appendChild(o),o.styleSheet?o.styleSheet.cssText=u:o.appendChild(document.createTextNode(u))}})(`.vue-danmaku {
  position: relative;
  overflow: hidden;
}
.vue-danmaku .danmus {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}
.vue-danmaku .danmus.show {
  opacity: 1;
}
.vue-danmaku .danmus.paused .dm.move {
  animation-play-state: paused;
}
.vue-danmaku .danmus .dm {
  position: absolute;
  font-size: 20px;
  color: #ddd;
  white-space: pre;
  transform: translateX(0);
  transform-style: preserve-3d;
}
.vue-danmaku .danmus .dm.move {
  will-change: transform;
  animation-name: moveLeft;
  animation-timing-function: linear;
  animation-play-state: running;
}
.vue-danmaku .danmus .dm.pause {
  animation-play-state: paused;
  z-index: 100;
}
@keyframes moveLeft {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(var(--dm-scroll-width));
  }
}
@-webkit-keyframes moveLeft {
  from {
    -webkit-transform: translateX(0);
  }
  to {
    -webkit-transform: translateX(var(--dm-scroll-width));
  }
}`),q.render=function(u,f,C,c,o,d){return A(),T("div",pe,[m("div",{ref:"dmContainer",class:V(["danmus",{show:!u.hidden},{paused:u.paused}])},null,2),Q(u.$slots,"default")],512)},q.__file="src/lib/Danmaku.vue";const he={class:"home-page"},ye=["src"],ge={class:"hero-content"},ke={class:"typing-title"},xe={class:"site-name-container"},we={class:"poetry"},be={class:"danmaku-input-area"},Se=K({__name:"index",setup(u){const f=i(null),C=i({content:"加载中...",author:""}),c=ee(),o=ce(),d=ve("showToast"),E=[{text:"三",color:"red"},{text:"段",color:"red"},{text:"荒",color:"red"},{text:"の",color:"white"},{text:"窝",color:"white"}],N=i([]),B=i(!0),I=()=>{N.value=[];let s=0;const r=setInterval(()=>{s<E.length?(N.value.push(E[s]),s++):clearInterval(r)},150)},x=setInterval(()=>{B.value=!B.value},530),w=i(""),b=i("#ffffff"),S=i([]),v=i(),p=i({channels:4,speeds:150,fontSize:24,enableSend:!1,top:80}),g=y(()=>f.value?{backgroundImage:`url(${f.value})`}:{}),U=async()=>{try{const r=await(await fetch(F.jinrishici)).json();C.value={content:r.content||"诗词加载失败",author:r.author||""}}catch(s){console.error("获取诗词失败:",s),C.value={content:"诗词加载失败",author:""}}},$=async()=>{var s,r;if(!w.value.trim()){d("请输入弹幕内容","info");return}try{const a=c.userInfo,n=(a==null?void 0:a.avatar)||F.guestAvatar,l=(a==null?void 0:a.uniqueId)||"user_1779243581625437300",e=(a==null?void 0:a.account)||"游客";console.log("发送弹幕 - uniqueId:",l);const t=await ie({弹幕内容:w.value,弹幕颜色:b.value,所属页面:"home",唯一ID:l},{uniqueId:l,account:e,avatar:n});t.success?(d("弹幕发送成功！","success"),S.value.push({text:w.value,color:b.value,avatar:n}),w.value="",setTimeout(()=>{var k;(k=v.value)==null||k.play()},100)):(console.error("弹幕发送失败:",t.message),t.message&&t.message.includes("权限")?(d("登录信息失效，请重新登录","error"),c.logout(),o.push("/login")):d(t.message||"发送弹幕失败","error"))}catch(a){console.error("发送弹幕失败:",a);const n=a;((s=n.response)==null?void 0:s.status)===403?(console.error("403错误：权限不足，可能是账号密码不正确或登录已过期"),d("权限不足，请检查登录状态或重新登录","error"),c.logout(),o.push("/login")):((r=n.response)==null?void 0:r.status)===401?(console.error("401错误：未授权"),d("登录信息已过期，请重新登录","error"),c.logout(),o.push("/login")):d("发送弹幕失败，请稍后重试","error")}},W=async()=>{try{const s=c.userInfo,r=(s==null?void 0:s.uniqueId)||"user_1779243581625437300",a=await de("home","",r);if(a.success&&a.data){const l=(Array.isArray(a.data)?a.data:[a.data]).map(e=>{if(!e)return null;const t=e.弹幕内容?String(e.弹幕内容):"",k=e.弹幕颜色?String(e.弹幕颜色):"#ffffff";let h="";if(e.账号数据)try{h=(typeof e.账号数据=="string"?JSON.parse(e.账号数据):e.账号数据).头像||""}catch{}return t?{text:t,color:k,avatar:h}:null}).filter(e=>e!==null);S.value=l.slice(-50)}}catch(s){console.error("加载历史弹幕失败:",s)}};return O(async()=>{try{c.loadUserInfo();try{const s=await te("首页");s&&s.url&&(f.value=s.url)}catch{console.log("获取背景图失败，使用默认背景")}await U(),await W(),I()}catch(s){console.error("获取数据失败:",s)}}),ae(()=>{clearInterval(x)}),(s,r)=>(A(),T("div",he,[m("div",{class:"hero-section",style:P(g.value)},[ne(oe(q),{class:"danmaku-container",danmus:S.value,"onUpdate:danmus":r[0]||(r[0]=a=>S.value=a),config:p.value,ref_key:"danmakuRef",ref:v,"use-slot":!0},{dm:se(({danmu:a})=>[m("div",{class:"custom-danmaku",style:P({color:a.color||"#ffffff"})},[a.avatar?(A(),T("img",{key:0,src:a.avatar,class:"danmaku-avatar"},null,8,ye)):me("",!0),m("span",null,R(a.text),1)],4)]),_:1},8,["danmus","config"]),r[3]||(r[3]=m("div",{class:"hero-overlay"},null,-1)),m("div",ge,[m("h1",ke,[m("span",xe,[(A(!0),T(le,null,re(N.value,(a,n)=>(A(),T("span",{key:n,class:V(["site-char",a.color]),style:P({animationDelay:`${n*.1}s`})},R(a.text),7))),128)),m("span",{class:V(["cursor",{hidden:!B.value}])},"|",2)])]),m("div",we,R(C.value.content)+" —— "+R(C.value.author),1),m("div",be,[X(m("input",{"onUpdate:modelValue":r[1]||(r[1]=a=>w.value=a),type:"text",placeholder:"输入弹幕内容...",maxlength:"50",onKeyup:ue($,["enter"])},null,544),[[j,w.value]]),X(m("input",{type:"color","onUpdate:modelValue":r[2]||(r[2]=a=>b.value=a),class:"color-picker"},null,512),[[j,b.value]]),m("button",{onClick:$,class:"send-btn"},"发送")])])],4),r[4]||(r[4]=m("div",{class:"main-content"},null,-1))]))}}),Ne=fe(Se,[["__scopeId","data-v-fce4795a"]]);export{Ne as default};
