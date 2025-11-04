"use strict";(self.webpackChunkant_design_pro=self.webpackChunkant_design_pro||[]).push([[92],{59650:function($a,Dn,U){U.r(Dn);var Ir=U(97857),o=U.n(Ir),Fr=U(15009),c=U.n(Fr),Pr=U(99289),k=U.n(Pr),Rr=U(5574),R=U.n(Rr),cn=U(59955),Ar=U(19693),ne=U(2453),zr=U(33900),Ue=U(37804),X=U(71230),m=U(15746),_=U(36039),Re=U(77683),Tr=U(66309),Nr=U(72269),ie=U(55054),Br=U(78957),j=U(67294),e=U(85893),Zr=function(){var Or=(0,j.useState)("\u7B49\u5F85\u72B6\u6001\u4E2D"),Cn=R()(Or,2),pn=Cn[0],je=Cn[1],Lr=(0,j.useState)(!1),kn=R()(Lr,2),_a=kn[0],jn=kn[1],Hr=(0,j.useState)("\u672A\u77E5\u8FD0\u8425\u5546"),Mn=R()(Hr,2),Wr=Mn[0],fe=Mn[1],Ur=(0,j.useState)(!1),En=R()(Ur,2),Ga=En[0],Ka=En[1],$r=(0,j.useState)({networkSpeed:{enabled:!1,interval:5},flowStats:{enabled:!1,interval:5},networkInfo:{enabled:!1,interval:5},tempMonitor:{enabled:!1,interval:5},carrierMCS:{enabled:!1,interval:5}}),In=R()($r,2),B=In[0],ge=In[1],Qr=(0,j.useState)({networkSpeed:null,flowStats:null,networkInfo:null,tempMonitor:null,carrierMCS:null}),Fn=R()(Qr,2),N=Fn[0],te=Fn[1],_r=(0,j.useState)({networkSpeed:0,flowStats:0,networkInfo:0,tempMonitor:0,carrierMCS:0}),Pn=R()(_r,2),Va=Pn[0],Ya=Pn[1],Gr=(0,j.useState)({stat:0,lac:"",ci:"",act:-1}),Rn=R()(Gr,2),qa=Rn[0],Kr=Rn[1],Vr=(0,j.useState)(null),An=R()(Vr,2),re=An[0],fn=An[1],Yr=(0,j.useState)(!1),zn=R()(Yr,2),$e=zn[0],Ve=zn[1],qr=(0,j.useState)(500),Tn=R()(qr,2),Jr=Tn[0],Xr=Tn[1],ea=(0,j.useState)(!1),Nn=R()(ea,2),na=Nn[0],mn=Nn[1],ra=(0,j.useState)(500),Bn=R()(ra,2),xn=Bn[0],Zn=Bn[1],Ae=(0,j.useRef)(null),Ye=(0,j.useRef)(null),qe=(0,j.useRef)(null),aa=(0,j.useState)(null),On=R()(aa,2),se=On[0],ta=On[1],sa=(0,j.useState)(!1),Ln=R()(sa,2),Hn=Ln[0],hn=Ln[1],ia=(0,j.useState)(!1),Wn=R()(ia,2),Ja=Wn[0],Je=Wn[1],la=(0,j.useState)(0),Un=R()(la,2),Xa=Un[0],oa=Un[1],ua=(0,j.useState)(null),$n=R()(ua,2),Qn=$n[0],et=$n[1],da=(0,j.useState)(!1),_n=R()(da,2),Xe=_n[0],ca=_n[1],pa=(0,j.useState)(null),Gn=R()(pa,2),Me=Gn[0],fa=Gn[1],ma=(0,j.useState)(null),Kn=R()(ma,2),Ee=Kn[0],xa=Kn[1],ha=(0,j.useState)(!1),Vn=R()(ha,2),nt=Vn[0],Yn=Vn[1],ga=(0,j.useState)(!1),qn=R()(ga,2),va=qn[0],Jn=qn[1],en=j.useRef([]),nn=j.useRef(!1),ba=(0,j.useState)({ipv6Address:"",netmask:"",gateway:"",dhcpServer:"",primaryDNS:"",secondaryDNS:"",maxRxData:0,maxTxData:0}),Xn=R()(ba,2),ze=Xn[0],Sa=Xn[1],wa=(0,j.useState)({ipv4Address:"",subnetMask:"",gateway:"",dhcpServer:"",primaryDNS:"",secondaryDNS:"",maxRxData:0,maxTxData:0}),er=R()(wa,2),Te=er[0],ya=er[1],Da=(0,j.useState)({capValue:0,description:""}),nr=R()(Da,2),gn=nr[0],Ca=nr[1],ka=function(){var f=k()(c()().mark(function n(i){var d;return c()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(!i){r.next=5;break}Zn(Jr),mn(!0),r.next=15;break;case 5:return r.prev=5,r.next=8,E.setPDCPDataReport(!1);case 8:d=r.sent,d.success?(Ve(!1),fn(null),hn(!1),ne.ZP.success("\u5173\u95ED\u5B9E\u65F6\u7F51\u901F\u6210\u529F")):ne.ZP.error("\u5173\u95ED\u5B9E\u65F6\u7F51\u901F\u5931\u8D25"),r.next=15;break;case 12:r.prev=12,r.t0=r.catch(5),ne.ZP.error("\u8BBE\u7F6EPDCP\u6570\u636E\u4E0A\u62A5\u5931\u8D25");case 15:case"end":return r.stop()}},n,null,[[5,12]])}));return function(i){return f.apply(this,arguments)}}(),ja=function(){var f=k()(c()().mark(function n(){var i;return c()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,a.next=3,E.setPDCPDataReport(!0,xn);case 3:i=a.sent,i.success?(Ve(!0),hn(!0),Xr(xn),ne.ZP.success("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u6210\u529F"),mn(!1)):ne.ZP.error("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u5931\u8D25"),a.next=10;break;case 7:a.prev=7,a.t0=a.catch(0),ne.ZP.error("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u5931\u8D25");case 10:case"end":return a.stop()}},n,null,[[0,7]])}));return function(){return f.apply(this,arguments)}}();(0,j.useEffect)(function(){var f=function(i){var d;if(i.type==="pdcp_data"&&"data"in i){var a=i.data;Hn||(hn(!0),console.log("\u{1F3AF} \u68C0\u6D4B\u5230PDCP\u63A8\u9001\u6570\u636E\uFF0C\u5B9E\u65F6\u7F51\u901F\u529F\u80FD\u5DF2\u5F00\u542F")),$e||(console.log("\u2705 \u540C\u6B65\u5B9E\u65F6\u7F51\u901F\u5F00\u5173\u72B6\u6001\u4E3A\u5F00\u542F"),Ve(!0)),(a.ulPdcpRate>0||a.dlPdcpRate>0)&&ta(a),fn(a)}if(i.type==="urc_data"&&"data"in i){var r=i.data;console.log("\u{1F4CA} \u6536\u5230 URC \u6570\u636E\u66F4\u65B0:",r.type,r.parsed);var u=!1;switch(r.type){case"HCSQ":if(u=!0,r.parsed){var s=r.parsed,t=s.networkMode,g=s.rsrp,v=s.rsrq,h=s.sinr,x=s.rssi,M=0,l=0,C=0,I=0;t==="LTE"?(M=g===0?-140:g>=97?-44:-140+g,l=v===0?-19.5:v>=34?-3:-19.5+v*.5,h!==void 0&&(C=h===0?-20:h>=251?30:-20+h*.2),x!==void 0&&(I=x===0?-90:x>=65?-25:-90+x)):t==="NR"&&(M=g===0?-156:g>=125?-31:-156+g,l=v===0?-43:v>=63?20:-43+v,h!==void 0&&(C=Math.round((h-46)/2))),me(function(J){return o()(o()({},J),{},{rscp:M,signalPercent:Se(M),ecio:Math.round(l),sinr:Math.round(C),rssi:I,sysMode:t})}),console.log("\u2705 URC \u66F4\u65B0\u4FE1\u53F7\u8D28\u91CF:",{mode:t,rsrp:M,rsrq:l,sinr:C,rssi:I})}break;case"RSSI":u=!0,((d=r.parsed)===null||d===void 0?void 0:d.rssi)!==void 0&&console.log("\u2705 URC \u66F4\u65B0 RSSI:",r.parsed.rssi);break;case"CERSSI":if(u=!0,r.parsed){var w=r.parsed,y=w.rsrp,S=w.rsrq,p=w.sinr;(y||S||p)&&(me(function(J){return o()(o()(o()(o()({},J),y&&{rscp:y}),S&&{ecio:S}),p&&{sinr:p})}),console.log("\u2705 URC \u66F4\u65B0\u6269\u5C55\u4FE1\u53F7\u6570\u636E:",{rsrp:y,rsrq:S,sinr:p}))}break;case"DSAMBR":if(r.parsed){var T=r.parsed,F=T.maxDownlinkRate,P=T.maxUplinkRate,V=T.apn,O=F/1e3,G=P/1e3;V&&ur(V),cr(O),fr(G),console.log("\u2705 URC \u66F4\u65B0 AMBR/APN:",{apn:V,maxDl:"".concat(O," Kbps"),maxUl:"".concat(G," Kbps")})}break;case"IMSSRVSTATUS":if(r.parsed){var H=r.parsed,Z=H.voiceStatus,Y=H.videoStatus,ee=H.utStatus,q=H.smsStatus;console.log("\u{1F4DE} URC \u66F4\u65B0 IMS \u670D\u52A1\u72B6\u6001:",{voice:Z,video:Y,ut:ee,sms:q})}break}u&&Ye.current&&qe.current&&(Ae.current&&clearTimeout(Ae.current),Ae.current=setTimeout(k()(c()().mark(function J(){var oe,L;return c()().wrap(function(D){for(;;)switch(D.prev=D.next){case 0:return console.log("\u{1F504} URC \u89E6\u53D1\u5B8C\u6574\u6570\u636E\u5237\u65B0"),D.next=3,Promise.all([(oe=qe.current)===null||oe===void 0?void 0:oe.call(qe),(L=Ye.current)===null||L===void 0?void 0:L.call(Ye)]);case 3:case"end":return D.stop()}},J)})),500))}};return E.subscribe(f),function(){E.unsubscribe(f),Ae.current&&(clearTimeout(Ae.current),Ae.current=null),$e&&E.setPDCPDataReport(!1).then(function(){Ve(!1),fn(null)}).catch(function(n){console.error("\u5173\u95EDPDCP\u6570\u636E\u4E0A\u62A5\u5931\u8D25:",n)})}},[$e,Hn]);var Ma=function(){return(0,e.jsx)(e.Fragment,{children:(0,e.jsx)(zr.Z,{title:"\u4E3B\u52A8\u5237\u65B0\u65F6\u95F4",open:na,onOk:ja,onCancel:function(){return mn(!1)},destroyOnClose:!0,children:(0,e.jsxs)("div",{style:{padding:"20px 0"},children:[(0,e.jsx)("div",{style:{marginBottom:"10px",color:"#666"},children:"\u4E3B\u52A8\u5237\u65B0\u65F6\u95F4\uFF08200-65535ms\uFF09\uFF1A"}),(0,e.jsx)(Ue.Z,{min:200,max:65535,step:100,value:xn,onChange:function(i){return i&&Zn(i)},addonAfter:"ms",style:{width:"100%"}}),(0,e.jsx)("div",{style:{marginTop:"10px",color:"#666",fontSize:"12px"},children:"\u8BF4\u660E\uFF1A\u95F4\u9694\u8D8A\u5C0F\uFF0C\u6570\u636E\u66F4\u65B0\u8D8A\u9891\u7E41\uFF0C\u4F46\u7CFB\u7EDF\u8D1F\u62C5\u8D8A\u5927"})]})})})},Ce=function(n,i,d){if(n==="networkInfo"){if(N.networkInfo&&(clearInterval(N.networkInfo),te(function(l){return o()(o()({},l),{},{networkInfo:null})}),Je(!1)),i&&B.carrierMCS.enabled&&(N.carrierMCS&&(clearInterval(N.carrierMCS),te(function(l){return o()(o()({},l),{},{carrierMCS:null})})),ge(function(l){return o()(o()({},l),{},{carrierMCS:o()(o()({},l.carrierMCS),{},{enabled:!1})})})),i){var a=function(){var l=k()(c()().mark(function C(){return c()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:try{Je(!0),le(k()(c()().mark(function y(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,Ne();case 2:return p.next=4,vn();case 4:case"end":return p.stop()}},y)})))}catch(y){console.error("\u5237\u65B0\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",y),ne.ZP.error("\u83B7\u53D6\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25"),ge(function(S){return o()(o()({},S),{},{networkInfo:o()(o()({},S.networkInfo),{},{enabled:!1})})}),N.networkInfo&&(clearInterval(N.networkInfo),te(function(S){return o()(o()({},S),{},{networkInfo:null})})),Je(!1)}case 1:case"end":return w.stop()}},C)}));return function(){return l.apply(this,arguments)}}();a();var r=setInterval(a,d*1e3);te(function(l){return o()(o()({},l),{},{networkInfo:r})})}ge(function(l){return o()(o()({},l),{},{networkInfo:{enabled:i,interval:d}})})}else if(n==="flowStats"){if(N.flowStats&&(clearInterval(N.flowStats),te(function(l){return o()(o()({},l),{},{flowStats:null})})),i){var u=function(){var l=k()(c()().mark(function C(){return c()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:try{le(k()(c()().mark(function y(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,Oe();case 2:case"end":return p.stop()}},y)})))}catch(y){console.error("\u5237\u65B0\u6D41\u91CF\u7EDF\u8BA1\u5931\u8D25:",y),ne.ZP.error("\u5237\u65B0\u6D41\u91CF\u7EDF\u8BA1\u5931\u8D25"),ge(function(S){return o()(o()({},S),{},{flowStats:o()(o()({},S.flowStats),{},{enabled:!1})})}),N.flowStats&&(clearInterval(N.flowStats),te(function(S){return o()(o()({},S),{},{flowStats:null})}))}case 1:case"end":return w.stop()}},C)}));return function(){return l.apply(this,arguments)}}();u();var s=setInterval(u,d*1e3);te(function(l){return o()(o()({},l),{},{flowStats:s})})}ge(function(l){return o()(o()({},l),{},{flowStats:{enabled:i,interval:d}})})}else if(n==="networkSpeed"){if(N.networkSpeed&&(clearInterval(N.networkSpeed),te(function(l){return o()(o()({},l),{},{networkSpeed:null})})),i){var t=function(){var l=k()(c()().mark(function C(){return c()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:try{le(k()(c()().mark(function y(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,Oe();case 2:case"end":return p.stop()}},y)})))}catch(y){console.error("\u5237\u65B0\u7F51\u901F\u6570\u636E\u5931\u8D25:",y),ne.ZP.error("\u5237\u65B0\u7F51\u901F\u6570\u636E\u5931\u8D25"),ge(function(S){return o()(o()({},S),{},{networkSpeed:o()(o()({},S.networkSpeed),{},{enabled:!1})})}),N.networkSpeed&&(clearInterval(N.networkSpeed),te(function(S){return o()(o()({},S),{},{networkSpeed:null})}))}case 1:case"end":return w.stop()}},C)}));return function(){return l.apply(this,arguments)}}();t();var g=setInterval(t,d*1e3);te(function(l){return o()(o()({},l),{},{networkSpeed:g})})}ge(function(l){return o()(o()({},l),{},{networkSpeed:{enabled:i,interval:d}})})}else if(n==="tempMonitor"){if(N.tempMonitor&&(clearInterval(N.tempMonitor),te(function(l){return o()(o()({},l),{},{tempMonitor:null})})),i){var v=function(){var l=k()(c()().mark(function C(){return c()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:try{le(k()(c()().mark(function y(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,Dr();case 2:case"end":return p.stop()}},y)})))}catch(y){console.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25:",y),ne.ZP.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25"),ge(function(S){return o()(o()({},S),{},{tempMonitor:o()(o()({},S.tempMonitor),{},{enabled:!1})})}),N.tempMonitor&&(clearInterval(N.tempMonitor),te(function(S){return o()(o()({},S),{},{tempMonitor:null})}))}case 1:case"end":return w.stop()}},C)}));return function(){return l.apply(this,arguments)}}();v();var h=setInterval(v,d*1e3);te(function(l){return o()(o()({},l),{},{tempMonitor:h})})}ge(function(l){return o()(o()({},l),{},{tempMonitor:{enabled:i,interval:d}})})}else if(n==="carrierMCS"){if(N.carrierMCS&&(clearInterval(N.carrierMCS),te(function(l){return o()(o()({},l),{},{carrierMCS:null})})),i){var x=function(){var l=k()(c()().mark(function C(){return c()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:try{le(k()(c()().mark(function y(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,Ne();case 2:return p.next=4,vn();case 4:case"end":return p.stop()}},y)})))}catch(y){console.error("\u5237\u65B0\u8F7D\u6CE2\u805A\u5408\u548CMCS\u5931\u8D25:",y),ne.ZP.error("\u5237\u65B0\u8F7D\u6CE2\u805A\u5408\u548CMCS\u5931\u8D25"),ge(function(S){return o()(o()({},S),{},{carrierMCS:o()(o()({},S.carrierMCS),{},{enabled:!1})})}),N.carrierMCS&&(clearInterval(N.carrierMCS),te(function(S){return o()(o()({},S),{},{carrierMCS:null})}))}case 1:case"end":return w.stop()}},C)}));return function(){return l.apply(this,arguments)}}();x();var M=setInterval(x,d*1e3);te(function(l){return o()(o()({},l),{},{carrierMCS:M})})}ge(function(l){return o()(o()({},l),{},{carrierMCS:{enabled:i,interval:d}})})}},rr={1:"2100 MHz (FDD)",2:"1900 MHz (FDD)",3:"1800 MHz (FDD)",5:"850 MHz (FDD)",7:"2600 MHz (FDD)",8:"900 MHz (FDD)",20:"800 MHz (FDD)",28:"700 MHz (FDD)",38:"2600 MHz (TDD)",40:"2300 MHz (TDD)",41:"2500 MHz (TDD)",77:"3700 MHz (TDD)",78:"3500 MHz (TDD)",79:"4700 MHz (TDD)"},ar={1:"2100 MHz (FDD)",2:"1900 MHz (FDD)",3:"1800 MHz (FDD)",5:"850 MHz (FDD)",7:"2600 MHz (FDD)",8:"900 MHz (FDD)",20:"800 MHz (FDD)",38:"2600 MHz (TDD)",40:"2300 MHz (TDD)",41:"2500 MHz (TDD)"},Ne=function(){var f=k()(c()().mark(function n(){return c()().wrap(function(d){for(;;)switch(d.prev=d.next){case 0:return d.abrupt("return",new Promise(function(){var a=k()(c()().mark(function r(u){var s,t,g,v,h,x,M,l,C,I,w,y,S,p,T,F,P,V,O,G,H,Z,Y,ee,q,J,oe,L,ke,D,Q,ue,he,we,ye,Ie,Fe,tn,A,z,be,Pe,Ge,kr,sn,de,jr,Mr,Er,ce,Le,ln,on,He,un,dn;return c()().wrap(function(W){for(;;)switch(W.prev=W.next){case 0:return W.prev=0,W.next=3,E.sendCommand("AT^MONSC");case 3:return s=W.sent,t={},s.success&&s.data&&(g=ve(s.data,"^MONSC","MONSC"),g&&(h=g.split(","),x=((v=h[0])===null||v===void 0?void 0:v.trim())||"",console.log("\u{1F4CB} MONSC \u6570\u636E:",h,"\u7CFB\u7EDF\u6A21\u5F0F:",x),h.length>=7?(I=((M=h[1])===null||M===void 0?void 0:M.trim())||"0",w=((l=h[2])===null||l===void 0?void 0:l.trim())||"0",y=((C=h[3])===null||C===void 0?void 0:C.trim())||"0",x==="LTE"?(ee=((V=h[4])===null||V===void 0?void 0:V.trim())||"0",q=((O=h[5])===null||O===void 0?void 0:O.trim())||"0",J=((G=h[6])===null||G===void 0?void 0:G.trim())||"0",T=parseInt(ee,16).toString(),S=parseInt(q,16),p=parseInt(J,16).toString(),F=parseInt(((H=h[7])===null||H===void 0?void 0:H.trim())||"0",10),P=parseFloat(((Z=h[8])===null||Z===void 0?void 0:Z.trim())||"0"),oe=parseInt(((Y=h[9])===null||Y===void 0?void 0:Y.trim())||"0",10),me(function(ae){return o()(o()({},ae),{},{rssi:oe})}),console.log("\u{1F4CB} LTE \u89E3\u6790 (\u5B98\u65B9\u683C\u5F0F):",{cid:T,pci:S,tac:p,rsrp:F,rsrq:P,rssi:oe})):x==="NR"?(we=((L=h[4])===null||L===void 0?void 0:L.trim())||"0",ye=((ke=h[5])===null||ke===void 0?void 0:ke.trim())||"0",Ie=((D=h[6])===null||D===void 0?void 0:D.trim())||"0",Fe=((Q=h[7])===null||Q===void 0?void 0:Q.trim())||"0",T=parseInt(ye,16).toString(),S=parseInt(Ie,16),p=parseInt(Fe,16).toString(),F=parseInt(((ue=h[8])===null||ue===void 0?void 0:ue.trim())||"0",10),P=parseFloat(((he=h[9])===null||he===void 0?void 0:he.trim())||"0"),console.log("\u{1F4CB} NR \u89E3\u6790 (\u5B98\u65B9\u683C\u5F0F):",{scs:we,cid:T,pci:S,tac:p,rsrp:F,rsrq:P,sinr:h[10]})):x==="WCDMA"?(Ge=((tn=h[5])===null||tn===void 0?void 0:tn.trim())||"0",kr=((A=h[6])===null||A===void 0?void 0:A.trim())||"0",T=parseInt(Ge,16).toString(),S=parseInt(((z=h[4])===null||z===void 0?void 0:z.trim())||"0",10),p=parseInt(kr,16).toString(),F=parseInt(((be=h[7])===null||be===void 0?void 0:be.trim())||"0",10),P=parseFloat(((Pe=h[9])===null||Pe===void 0?void 0:Pe.trim())||"0"),console.log("\u{1F4CB} WCDMA \u89E3\u6790 (\u5B98\u65B9\u683C\u5F0F):",{psc:S,cid:T,lac:p,rscp:F,rxlev:h[8],ecio:P})):(T="0",S=0,p="0",F=0,P=0,console.warn("\u26A0\uFE0F \u672A\u77E5\u7CFB\u7EDF\u6A21\u5F0F:",x)),t={mcc:I,mnc:w,channel:y,cid:T,pci:S,lac:p,rscp:F||0,signalPercent:Se(F||0),ecio:P||0,sysMode:x},console.log("\u2705 MONSC \u89E3\u6790\u6210\u529F:",t)):console.warn("\u26A0\uFE0F MONSC \u6570\u636E\u5B57\u6BB5\u4E0D\u8DB3:",h.length))),W.next=8,E.sendCommand("AT^HFREQINFO?");case 8:if(sn=W.sent,de=[],sn.success&&sn.data&&(jr=Qe(sn.data,"^HFREQINFO","HFREQINFO"),jr.forEach(function(ae){if(ae){var pe=ae.split(",");if(pe.length>=9)for(var We=pe[1],De=2,Wa=We==="7"?3:4;De+6<=pe.length&&de.length<Wa;){var Ke=parseInt(pe[De]),Ua=We==="7"?"n".concat(Ke):"B".concat(Ke);de.push({band:Ke.toString(),bandShortName:Ua,bandDesc:We==="7"?rr[Ke.toString()]||"\u672A\u77E5\u9891\u6BB5":ar[Ke.toString()]||"\u672A\u77E5\u9891\u6BB5",dlFcn:pe[De+1].trim(),dlFreq:(parseInt(pe[De+2])*(We==="7"?.001:.1)).toFixed(2),dlBandwidth:parseInt(pe[De+3])/1e3,ulFcn:pe[De+4].trim(),ulFreq:(parseInt(pe[De+5])*(We==="7"?.001:.1)).toFixed(2),ulBandwidth:parseInt(pe[De+6])/1e3,sysMode:We==="7"?"NR":"LTE"}),De+=7}}})),Mr=parseFloat(de.reduce(function(ae,pe){return ae+pe.dlBandwidth},0).toFixed(2)),Er=parseFloat(de.reduce(function(ae,pe){return ae+pe.ulBandwidth},0).toFixed(2)),ce="",!(de.length>0)){W.next=34;break}if(!(de.some(function(ae){return ae.sysMode==="NR"})&&de.some(function(ae){return ae.sysMode==="LTE"}))){W.next=19;break}ce="EN-DC (LTE+NR)",W.next=32;break;case 19:if(!de.some(function(ae){return ae.sysMode==="NR"})){W.next=23;break}ce=de.length>1?"NR-CA":"NR",W.next=32;break;case 23:if(!de.some(function(ae){return ae.sysMode==="LTE"})){W.next=27;break}ce=de.length>1?"LTE-CA":"LTE",W.next=32;break;case 27:return W.next=29,E.sendCommand("AT^HCSQ?");case 29:ln=W.sent,on=ln==null||(Le=ln.data)===null||Le===void 0||(Le=Le.split(",")[0])===null||Le===void 0?void 0:Le.replace(/"/g,""),on==="NR"?ce="NR":on==="LTE"?ce="LTE":on==="WCDMA"?ce="WCDMA":ce="\u672A\u77E5";case 32:W.next=39;break;case 34:return W.next=36,E.sendCommand("AT^HCSQ?");case 36:un=W.sent,dn=un==null||(He=un.data)===null||He===void 0||(He=He.split(",")[0])===null||He===void 0?void 0:He.replace(/"/g,""),dn==="NR"?ce="NR":dn==="LTE"?ce="LTE":dn==="WCDMA"?ce="WCDMA":ce="\u672A\u77E5";case 39:me(function(ae){return o()(o()(o()({},ae),t),{},{carrierInfo:de,carrierCount:de.length,dlBandwidth:Mr,ulBandwidth:Er,networkMode:ce,sysMode:ce})}),u(),W.next=47;break;case 43:W.prev=43,W.t0=W.catch(0),console.error("\u83B7\u53D6\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",W.t0),u();case 47:case"end":return W.stop()}},r,null,[[0,43]])}));return function(r){return a.apply(this,arguments)}}()));case 1:case"end":return d.stop()}},n)}));return function(){return f.apply(this,arguments)}}();qe.current=Ne;var Ea=(0,j.useState)({rscp:0,signalPercent:"",ecio:0,sinr:0,rssi:0,mcc:"",mnc:"",lac:"",cid:"",channel:"",band:"",dlBandwidth:0,ulBandwidth:0,pci:0,carrierInfo:[],carrierCount:0,networkMode:"",sysMode:"\u672A\u77E5"}),tr=R()(Ea,2),b=tr[0],me=tr[1],Ia=(0,j.useState)({sub3GPA:0,sub6GPA:0,mimoPa:0,tcxo:0,peri1:0,peri2:0,ap1:0,ap2:0,modem1:0,modem2:0,bbp1:0,bbp2:0}),sr=R()(Ia,2),K=sr[0],ir=sr[1],E=cn.S.getInstance(),Fa=function(n){return n===255?"\u672A\u4F7F\u7528":n<=9?"QPSK":n<=16?"16QAM":n<=28?"64QAM":"256QAM"},Pa=function(n){return n===255?{level:"\u672A\u4F7F\u7528",color:"#999"}:n<=9?{level:"\u5DEE",color:"#ff4d4f"}:n<=16?{level:"\u4E00\u822C",color:"#faad14"}:n<=23?{level:"\u597D",color:"#52c41a"}:{level:"\u4F18\u79C0",color:"#1890ff"}},vn=function(){var f=k()(c()().mark(function n(){var i,d;return c()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,Yn(!0),r.next=4,E.sendCommand("AT^MCS=1");case 4:return i=r.sent,i.success&&i.data&&lr(i.data,"downlink"),r.next=8,E.sendCommand("AT^MCS=0");case 8:d=r.sent,d.success&&d.data&&lr(d.data,"uplink"),r.next=15;break;case 12:r.prev=12,r.t0=r.catch(0),console.error("\u83B7\u53D6MCS\u4FE1\u606F\u5931\u8D25:",r.t0);case 15:return r.prev=15,Yn(!1),r.finish(15);case 18:case"end":return r.stop()}},n,null,[[0,12,15,18]])}));return function(){return f.apply(this,arguments)}}(),lr=function(n,i){try{var d=Qe(n,"^MCS","MCS");if(d.length===0){console.warn("\u26A0\uFE0F MCS\u6570\u636E\u4E3A\u7A7A\uFF0C\u53EF\u80FD\u88ABURC\u6C61\u67D3");return}var a=[],r="UNKNOWN";d.forEach(function(g){var v=g.match(/(\d+),(\d+),(.+)/);if(v){var h=v[1],x=v[2],M=v[3].split(",").map(function(y){return parseInt(y.trim())});x==="1"?r="NR":x==="0"&&r==="UNKNOWN"&&(r="LTE");for(var l=0;l<M.length;l+=3)if(l+2<M.length){var C=M[l+1],I=M[l+2],w=Pa(C);a.push({index:a.length+1,mcsTableIndex:M[l],code0:C,code1:I,modulation:Fa(C),performance:w.level,color:w.color})}}});var u=a.map(function(g){return g.code0}).filter(function(g){return g!==255}),s=u.length>0?Math.round(u.reduce(function(g,v){return g+v},0)/u.length):0,t={rat:r,carriers:a,avgMCS:s};i==="downlink"?xa(t):fa(t)}catch(g){console.error("\u89E3\u6790MCS\u6570\u636E\u5931\u8D25:",g)}},Ra=function(){var f=k()(c()().mark(function n(){var i;return c()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(!nn.current){a.next=3;break}return console.log("\u961F\u5217\u6B63\u5728\u5904\u7406\u4E2D\uFF0C\u8DF3\u8FC7\u672C\u6B21\u8C03\u7528"),a.abrupt("return");case 3:nn.current=!0,Jn(!0);case 5:if(!(en.current.length>0)){a.next=18;break}if(i=en.current.shift(),!i){a.next=16;break}return a.prev=8,a.next=11,i();case 11:a.next=16;break;case 13:a.prev=13,a.t0=a.catch(8),console.error("\u547D\u4EE4\u6267\u884C\u5931\u8D25:",a.t0);case 16:a.next=5;break;case 18:nn.current=!1,Jn(!1);case 20:case"end":return a.stop()}},n,null,[[8,13]])}));return function(){return f.apply(this,arguments)}}(),le=function(n){en.current.push(n),Ra()},Aa=(0,j.useState)(""),or=R()(Aa,2),za=or[0],ur=or[1],Ta=(0,j.useState)(0),dr=R()(Ta,2),bn=dr[0],cr=dr[1],Na=(0,j.useState)(0),pr=R()(Na,2),Sn=pr[0],fr=pr[1],wn=function(){var f=k()(c()().mark(function n(){var i,d,a,r,u,s,t;return c()().wrap(function(v){for(;;)switch(v.prev=v.next){case 0:return v.prev=0,v.next=3,E.sendCommand("AT^DSAMBR=1");case 3:if(i=v.sent,!(!i.success||!i.data)){v.next=8;break}return v.next=7,E.sendCommand("AT^DSAMBR=8");case 7:i=v.sent;case 8:i.success&&i.data&&(d=ve(i.data,"^DSAMBR","DSAMBR"),d&&(a=d.split(","),a.length>=4&&(r=a[3].trim(),u=r.replace(/^["']|["']$/g,""),ur(u),s=(parseInt(a[1])||0)/1e3,t=(parseInt(a[2])||0)/1e3,cr(s),fr(t)))),v.next=14;break;case 11:v.prev=11,v.t0=v.catch(0),ne.ZP.error("\u83B7\u53D6 AMBR \u4FE1\u606F\u5931\u8D25");case 14:case"end":return v.stop()}},n,null,[[0,11]])}));return function(){return f.apply(this,arguments)}}(),Ba=(0,j.useState)("\u672A\u77E5"),mr=R()(Ba,2),xr=mr[0],xe=mr[1],yn=function(){var f=k()(c()().mark(function n(){var i,d,a,r,u;return c()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,E.sendCommand("AT+CGEQOSRDP=8");case 3:if(i=t.sent,!(!i.success||!i.data)){t.next=8;break}return t.next=7,E.sendCommand("AT+CGEQOSRDP=1");case 7:i=t.sent;case 8:if(!(i.success&&i.data)){t.next=40;break}if(d=ve(i.data,"+CGEQOSRDP","CGEQOSRDP"),!d){t.next=37;break}r=d.split(","),u=(a=r[1])===null||a===void 0?void 0:a.trim(),t.t0=u,t.next=t.t0==="1"?16:t.t0==="2"?18:t.t0==="3"?20:t.t0==="4"?22:t.t0==="5"?24:t.t0==="6"?26:t.t0==="7"?28:t.t0==="8"?30:t.t0==="9"?32:34;break;case 16:return xe("\u7B49\u7EA71\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-2,\u9AD8\u4F18\u5148\u7EA7\u8BED\u97F3\u901A\u8BDD"),t.abrupt("break",35);case 18:return xe("\u7B49\u7EA72\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF150ms,\u4E22\u5305\u738710^-3,\u6807\u51C6\u8BED\u97F3\u901A\u8BDD"),t.abrupt("break",35);case 20:return xe("\u7B49\u7EA73\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF50ms,\u4E22\u5305\u738710^-3,\u5B9E\u65F6\u6E38\u620F"),t.abrupt("break",35);case 22:return xe("\u7B49\u7EA74\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u975E\u4F1A\u8BDD\u89C6\u9891"),t.abrupt("break",35);case 24:return xe("\u7B49\u7EA75\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-6,IMS\u4FE1\u4EE4"),t.abrupt("break",35);case 26:return xe("\u7B49\u7EA76\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u89C6\u9891\u6D41\u5A92\u4F53"),t.abrupt("break",35);case 28:return xe("\u7B49\u7EA77\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-3,\u8BED\u97F3\u3001\u89C6\u9891\u3001\u4E92\u52A8\u6E38\u620F"),t.abrupt("break",35);case 30:return xe("\u7B49\u7EA78\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u89C6\u9891\u6D41\u5A92\u4F53\u3001TCP\u5E94\u7528"),t.abrupt("break",35);case 32:return xe("\u7B49\u7EA79\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u6807\u51C6\u6570\u636E\u4F20\u8F93"),t.abrupt("break",35);case 34:xe("QCI ".concat(u,"\uFF1A\u672A\u77E5\u670D\u52A1\u7B49\u7EA7"));case 35:t.next=38;break;case 37:xe("\u672A\u80FD\u83B7\u53D6\u670D\u52A1\u7B49\u7EA7\u4FE1\u606F");case 38:t.next=41;break;case 40:xe("\u672A\u80FD\u83B7\u53D6\u670D\u52A1\u7B49\u7EA7\u4FE1\u606F");case 41:t.next=46;break;case 43:t.prev=43,t.t1=t.catch(0),ne.ZP.error("\u83B7\u53D6\u670D\u52A1\u7B49\u7EA7\u4FE1\u606F\u5931\u8D25");case 46:case"end":return t.stop()}},n,null,[[0,43]])}));return function(){return f.apply(this,arguments)}}(),rt=function(n){var i=["^PDCPDATAINFO:","RING","+CMT:","+CMTI:","^SIMST:","^SRVST:","^ANLEVEL:","^THERM:","^MODE:","^NDISSTAT:","^SIMRESET:","+CEREG:","+CGREG:","^BOOT:","^RESET:","^CARDMODE:","^CCALLSTATE:","^CEND:","^CONF:","^CONN:","^CSCHANNELINFO:","^DSDORMANT:","^ORIG:","^PSSTATEIND:","^SYSINFO:","^TIMEQRYIND:","^POSEND:","^POSITION:","^NETSCAN:","^DSFLOWRPT:"];return i.some(function(d){return n.includes(d)})},ve=function(n,i,d){console.log("\u{1F4CB} ".concat(d," \u54CD\u5E94:"),n.substring(0,100));var a=i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),r=new RegExp("".concat(a,":\\s*([^\\r\\n]+)")),u=n.match(r);return u?(console.log("\u2705 ".concat(d," \u63D0\u53D6\u6570\u636E:"),u[1]),u[1]):(console.warn("\u26A0\uFE0F ".concat(d," \u54CD\u5E94\u683C\u5F0F\u4E0D\u5339\u914D:"),n.substring(0,80)),null)},Qe=function(n,i,d){console.log("\u{1F4CB} ".concat(d," \u54CD\u5E94:"),n.substring(0,100));var a=n.split(`
`),r=[],u=i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),s=new RegExp("".concat(u,":\\s*(.+)"));return a.forEach(function(t){var g=t.match(s);g&&g[1]&&r.push(g[1].trim())}),r.length>0?console.log("\u2705 ".concat(d," \u63D0\u53D6 ").concat(r.length," \u884C\u6570\u636E")):console.warn("\u26A0\uFE0F ".concat(d," \u672A\u63D0\u53D6\u5230\u6570\u636E")),r},hr=function(){var f=k()(c()().mark(function n(){var i,d,a,r,u,s,t,g,v,h,x,M,l,C,I,w,y;return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.prev=0,p.next=3,E.sendCommand("AT^DHCPV6?");case 3:return i=p.sent,i.success&&i.data&&(d=ve(i.data,"^DHCPV6","DHCPV6"),d&&(a=d.split(","),a.length>=8?Sa({ipv6Address:a[0].trim(),netmask:a[1].trim(),gateway:a[2].trim(),dhcpServer:a[3].trim(),primaryDNS:a[4].trim(),secondaryDNS:a[5].trim(),maxRxData:parseInt(a[6].trim())||0,maxTxData:parseInt(a[7].trim())||0}):console.warn("\u26A0\uFE0F DHCPV6 \u6570\u636E\u5B57\u6BB5\u4E0D\u8DB3:",a.length))),p.next=7,E.sendCommand("AT^DHCP?");case 7:return r=p.sent,r.success&&r.data&&(u=ve(r.data,"^DHCP","DHCP"),u&&(s=u.split(","),s.length>=8&&(t=s[0].trim(),g=s[1].trim(),v=s[2].trim(),h=s[3].trim(),x=s[4].trim(),M=s[5].trim(),l=function(F){if(!F||typeof F!="string")return console.warn("\u26A0\uFE0F hexToIP: \u65E0\u6548\u7684\u8F93\u5165",F),"0.0.0.0";var P=F.trim().replace(/[\r\n]/g,"");if(!/^[0-9A-Fa-f]+$/.test(P))return console.warn("\u26A0\uFE0F hexToIP: \u975E\u5341\u516D\u8FDB\u5236\u5B57\u7B26",P),"0.0.0.0";P.length!==8&&(console.warn("\u26A0\uFE0F hexToIP: \u957F\u5EA6\u4E0D\u6B63\u786E",P,"\u957F\u5EA6:",P.length),P=P.padStart(8,"0").substring(0,8),console.log("\u{1F527} \u4FEE\u6B63\u4E3A:",P));for(var V=[],O=0;O<8;O+=2){var G=P.substring(O,O+2),H=parseInt(G,16);isNaN(H)?(console.warn("\u26A0\uFE0F hexToIP: \u5B57\u8282\u89E3\u6790\u5931\u8D25",G),V.push(0)):V.push(H)}for(;V.length<4;)V.push(0);return V.reverse().join(".")},ya({ipv4Address:l(t),subnetMask:l(g),gateway:l(v),dhcpServer:l(h),primaryDNS:l(x),secondaryDNS:l(M),maxRxData:parseInt(s[6].trim())||0,maxTxData:parseInt(s[7].trim())||0})))),p.next=11,E.sendCommand("AT^IPV6CAP?");case 11:if(C=p.sent,!(C.success&&C.data)){p.next=35;break}if(I=ve(C.data,"^IPV6CAP","IPV6CAP"),!I){p.next=35;break}if(w=parseInt(I.trim()),isNaN(w)){p.next=34;break}y="",p.t0=w,p.next=p.t0===1?21:p.t0===2?23:p.t0===7?25:p.t0===11?27:29;break;case 21:return y="\u4EC5\u652F\u6301IPv4\u534F\u8BAE",p.abrupt("break",31);case 23:return y="\u4EC5\u652F\u6301IPv6\u534F\u8BAE",p.abrupt("break",31);case 25:return y="\u652F\u6301IPv4\u3001IPv6\u548C\u53CC\u6808\u6A21\u5F0F\uFF08\u4F7F\u7528\u76F8\u540CAPN\uFF09",p.abrupt("break",31);case 27:return y="\u652F\u6301IPv4\u3001IPv6\u548C\u53CC\u6808\u6A21\u5F0F\uFF08\u4F7F\u7528\u4E0D\u540CAPN\uFF09",p.abrupt("break",31);case 29:return y="\u672A\u77E5\u80FD\u529B\u503C (0x".concat(w.toString(16).toUpperCase(),")"),p.abrupt("break",31);case 31:Ca({capValue:w,description:y}),p.next=35;break;case 34:console.warn("\u26A0\uFE0F IPV6CAP \u503C\u89E3\u6790\u5931\u8D25:",I);case 35:p.next=40;break;case 37:p.prev=37,p.t1=p.catch(0),console.error("\u83B7\u53D6DHCP\u4FE1\u606F\u5931\u8D25:",p.t1);case 40:case"end":return p.stop()}},n,null,[[0,37]])}));return function(){return f.apply(this,arguments)}}(),Za=(0,j.useState)({lastDsTime:0,lastTxFlow:0,lastRxFlow:0,totalDsTime:0,totalTxFlow:0,totalRxFlow:0}),gr=R()(Za,2),Be=gr[0],Oa=gr[1],La=(0,j.useState)({upSpeed:0,downSpeed:0,lastUpdateTime:0,lastTxFlow:0,lastRxFlow:0}),vr=R()(La,2),_e=vr[0],br=vr[1],Ze=function(n){return parseInt(n,16)},rn=function(n){return n<1024?"".concat(n," B"):n<1024*1024?"".concat((n/1024).toFixed(2)," KB"):n<1024*1024*1024?"".concat((n/(1024*1024)).toFixed(2)," MB"):n<1024*1024*1024*1024?"".concat((n/(1024*1024*1024)).toFixed(2)," GB"):"".concat((n/(1024*1024*1024*1024)).toFixed(2)," TB")},an=function(n){var i=n*8;return i>=1e9?"".concat((i/1e9).toFixed(2)," Gbps"):i>=1e6?"".concat((i/1e6).toFixed(2)," Mbps"):i>=1e3?"".concat((i/1e3).toFixed(2)," Kbps"):"".concat(Math.round(i)," bps")},Sr=function(n){if(Xe){var i=Math.floor(n/86400),d=Math.floor(n%86400/3600),a=Math.floor(n%3600/60),r=n%60;return"".concat(i,"\u5929").concat(d,"\u65F6").concat(a,"\u5206").concat(r,"\u79D2")}else{var u=Math.floor(n/3600),s=Math.floor(n%3600/60),t=n%60;return"".concat(u,"\u65F6").concat(s,"\u5206").concat(t,"\u79D2")}},Oe=function(){var f=k()(c()().mark(function n(){var i,d,a,r,u,s,t,g,v,h,x;return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.prev=0,l.next=3,E.sendCommand("AT^DSFLOWQRY");case 3:i=l.sent,console.log("\u{1F50D} DSFLOWQRY \u539F\u59CB\u54CD\u5E94:",i),i.success&&i.data&&(d=ve(i.data,"^DSFLOWQRY","DSFLOWQRY"),console.log("\u{1F50D} DSFLOWQRY \u63D0\u53D6\u7ED3\u679C:",d),d&&(a=d.split(","),console.log("\u{1F50D} DSFLOWQRY \u5206\u5272\u6570\u636E:",a),a.length>=6&&(r=Date.now(),u=Ze(a[4]),s=Ze(a[5]),_e.lastUpdateTime>0?(t=(r-_e.lastUpdateTime)/1e3,t>0&&(g=u-_e.lastTxFlow,v=s-_e.lastRxFlow,h=g/t,x=v/t,br({upSpeed:h,downSpeed:x,lastUpdateTime:r,lastTxFlow:u,lastRxFlow:s}))):br(o()(o()({},_e),{},{lastUpdateTime:r,lastTxFlow:u,lastRxFlow:s})),Oa({lastDsTime:Ze(a[0]),lastTxFlow:Ze(a[1]),lastRxFlow:Ze(a[2]),totalDsTime:Ze(a[3]),totalTxFlow:u,totalRxFlow:s})))),l.next=11;break;case 8:l.prev=8,l.t0=l.catch(0),ne.ZP.error("\u83B7\u53D6\u6D41\u91CF\u7EDF\u8BA1\u4FE1\u606F\u5931\u8D25");case 11:case"end":return l.stop()}},n,null,[[0,8]])}));return function(){return f.apply(this,arguments)}}(),Ha=function(){var f=k()(c()().mark(function n(){var i;return c()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,a.next=3,E.sendCommand("AT^DSFLOWCLR");case 3:i=a.sent,i.success?(ne.ZP.success("\u6D41\u91CF\u7EDF\u8BA1\u5DF2\u6E05\u96F6"),Oe()):ne.ZP.error("\u6D41\u91CF\u7EDF\u8BA1\u6E05\u96F6\u5931\u8D25"),a.next=10;break;case 7:a.prev=7,a.t0=a.catch(0),ne.ZP.error("\u6D41\u91CF\u7EDF\u8BA1\u6E05\u96F6\u5931\u8D25");case 10:case"end":return a.stop()}},n,null,[[0,7]])}));return function(){return f.apply(this,arguments)}}(),wr=function(){var f=k()(c()().mark(function n(){return c()().wrap(function(d){for(;;)switch(d.prev=d.next){case 0:return d.abrupt("return",new Promise(function(){var a=k()(c()().mark(function r(u){var s,t,g,v,h,x,M,l,C,I,w,y,S,p,T,F,P,V,O,G,H,Z,Y,ee,q,J,oe,L;return c()().wrap(function(D){for(;;)switch(D.prev=D.next){case 0:return D.prev=0,D.next=3,E.sendCommand("AT^HCSQ?");case 3:return s=D.sent,s.success&&s.data&&(t=Qe(s.data,"^HCSQ","HCSQ"),g=null,v=null,t.forEach(function(Q){if(Q){var ue,he=Q.split(","),we=((ue=he[0])===null||ue===void 0?void 0:ue.replace(/"/g,""))||"";we==="LTE"?g=he:we==="NR"&&(v=he)}}),v?(h=v,x=parseInt(h[1]),!isNaN(x)&&x!==255&&(M=x===0?-140:x>=97?-44:-140+x,l=Se(M),C=h.length>2?parseInt(h[2]):255,I=0,C!==255&&!isNaN(C)&&(I=C===0?-20:C>=251?30:-20+C*.2,I=Math.min(30,Math.max(-20,I))),console.log("\u{1F50D} NR SINR\u8BA1\u7B97:",{nr_sinr:C,sinrDb:I}),me(function(Q){return o()(o()({},Q),{},{rscp:M,signalPercent:l,sinr:Math.round(I),sysMode:"NR"})}))):g&&(w=g,y=parseInt(w[1]),!isNaN(y)&&y!==255&&(S=y===0?-140:y>=97?-44:-140+y,p=Se(S),T=w.length>4?parseInt(w[4]):255,F=0,T!==255&&!isNaN(T)&&(F=T===0?-20:T>=251?30:-20+T*.2,F=Math.min(30,Math.max(-20,F))),P=w.length>2?parseInt(w[2]):255,V=P!==255&&!isNaN(P)?P===0?-19.5:P>=34?-3:-19.5+P*.5:0,O=w.length>3?parseInt(w[3]):255,G=O!==255&&!isNaN(O)?O===0?-90:O>=65?-25:-90+O:0,console.log("\u{1F50D} LTE HCSQ \u89E3\u6790:",{lte_rsrp:y,rsrpDbm:S,lte_rsrq:P,rsrqDb:V,lte_rssi:O,rssiDbm:G,lte_sinr:T,sinrDb:F}),me(function(Q){return o()(o()({},Q),{},{rscp:S,signalPercent:p,sinr:Math.round(F),ecio:Math.round(V),rssi:G,sysMode:"LTE"})})))),D.next=7,E.sendCommand("AT^EONS=2");case 7:if(H=D.sent,!(H.success&&H.data)){D.next=30;break}if(Z=ve(H.data,"^EONS","EONS"),!Z){D.next=29;break}ee=Z.split(","),q=(Y=ee[1])===null||Y===void 0?void 0:Y.trim().replace(/"/g,""),console.log("\u{1F4CB} \u8FD0\u8425\u5546\u4EE3\u7801:",q),D.t0=q,D.next=D.t0==="46000"||D.t0==="46002"||D.t0==="46004"||D.t0==="46007"||D.t0==="46008"||D.t0==="46020"?17:D.t0==="46001"||D.t0==="46006"||D.t0==="46009"?19:D.t0==="46003"||D.t0==="46005"||D.t0==="46011"?21:D.t0==="46015"?23:25;break;case 17:return fe("\u4E2D\u56FD\u79FB\u52A8"),D.abrupt("break",27);case 19:return fe("\u4E2D\u56FD\u8054\u901A"),D.abrupt("break",27);case 21:return fe("\u4E2D\u56FD\u7535\u4FE1"),D.abrupt("break",27);case 23:return fe("\u4E2D\u56FD\u5E7F\u7535"),D.abrupt("break",27);case 25:console.warn("\u26A0\uFE0F \u672A\u8BC6\u522B\u7684\u8FD0\u8425\u5546\u4EE3\u7801:",q),fe("\u672A\u77E5\u8FD0\u8425\u5546");case 27:D.next=30;break;case 29:fe("\u672A\u77E5\u8FD0\u8425\u5546");case 30:return D.next=32,wn();case 32:return D.next=34,yn();case 34:return D.next=36,hr();case 36:return D.next=38,Oe();case 38:return D.next=40,E.sendCommand("AT^CHIPTEMP?");case 40:J=D.sent,J.success&&J.data&&(oe=ve(J.data,"^CHIPTEMP","CHIPTEMP"),oe&&(L=oe.split(","),L.length>=12?(ir({sub3GPA:$(parseInt(L[0]||"0")),sub6GPA:$(parseInt(L[1]||"0")),mimoPa:$(parseInt(L[2]||"0")),tcxo:$(parseInt(L[3]||"0")),peri1:$(parseInt(L[4]||"0")),peri2:$(parseInt(L[5]||"0")),ap1:$(parseInt(L[6]||"0")),ap2:$(parseInt(L[7]||"0")),modem1:$(parseInt(L[8]||"0")),modem2:$(parseInt(L[9]||"0")),bbp1:$(parseInt(L[10]||"0")),bbp2:$(parseInt(L[11]||"0"))}),console.log("\u2705 CHIPTEMP \u89E3\u6790\u6210\u529F")):console.warn("\u26A0\uFE0F CHIPTEMP \u6570\u636E\u5B57\u6BB5\u4E0D\u8DB3:",L.length))),u(),D.next=49;break;case 45:D.prev=45,D.t1=D.catch(0),console.error("\u83B7\u53D6\u7F51\u7EDC\u72B6\u6001\u5931\u8D25:",D.t1),u();case 49:case"end":return D.stop()}},r,null,[[0,45]])}));return function(r){return a.apply(this,arguments)}}()));case 1:case"end":return d.stop()}},n)}));return function(){return f.apply(this,arguments)}}();Ye.current=wr;var yr=function(){var f=k()(c()().mark(function n(){var i,d;return c()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,r.next=3,E.getPSRegStatus();case 3:if(i=r.sent,!(i.success&&i.data)){r.next=23;break}d=JSON.parse(i.data),Kr(d),r.t0=d.stat,r.next=r.t0===0?10:r.t0===1?12:r.t0===2?14:r.t0===3?16:r.t0===4?18:r.t0===5?20:22;break;case 10:return je("\u672A\u641C\u7D22\u7F51\u7EDC"),r.abrupt("break",23);case 12:return je("\u5DF2\u6CE8\u518C\uFF0C\u672C\u5730\u7F51\u7EDC"),r.abrupt("break",23);case 14:return je("\u6B63\u5728\u641C\u7D22\u7F51\u7EDC..."),r.abrupt("break",23);case 16:return je("\u6CE8\u518C\u88AB\u62D2\u7EDD"),r.abrupt("break",23);case 18:return je("\u672A\u77E5\u72B6\u6001"),r.abrupt("break",23);case 20:return je("\u5DF2\u6CE8\u518C\uFF0C\u6F2B\u6E38\u7F51\u7EDC"),r.abrupt("break",23);case 22:je("\u672A\u77E5\u72B6\u6001");case 23:r.next=27;break;case 25:r.prev=25,r.t1=r.catch(0);case 27:case"end":return r.stop()}},n,null,[[0,25]])}));return function(){return f.apply(this,arguments)}}(),at=function(){var f=k()(c()().mark(function n(){var i,d,a,r,u,s,t,g,v,h,x,M,l,C,I,w,y,S,p,T,F,P,V,O,G,H,Z,Y,ee,q,J,oe,L,ke,D,Q,ue,he,we,ye,Ie,Fe;return c()().wrap(function(A){for(;;)switch(A.prev=A.next){case 0:return A.prev=0,A.next=3,E.sendCommand("AT^HCSQ?");case 3:return i=A.sent,i.success&&i.data&&(d=Qe(i.data,"^HCSQ","HCSQ"),a=null,r=null,d.forEach(function(z){if(z){var be,Pe=z.split(","),Ge=((be=Pe[0])===null||be===void 0?void 0:be.replace(/"/g,""))||"";Ge==="LTE"?a=Pe:Ge==="NR"&&(r=Pe)}}),r?(u=r,s=parseInt(u[1]),!isNaN(s)&&s!==255&&(t=s===0?-140:s>=97?-44:-140+s,g=u.length>2?parseInt(u[2]):255,v=0,g!==255&&!isNaN(g)&&(v=g===0?-20:g>=251?30:-20+g*.2,v=Math.min(30,Math.max(-20,v))),h=u.length>3?parseInt(u[3]):255,x=h!==255&&!isNaN(h)?h===0?-19.5:h>=34?-3:-19.5+h*.5:0,me(function(z){return o()(o()({},z),{},{rscp:t,signalPercent:Se(t),sinr:Math.round(v),sysMode:"NR",networkMode:a?"EN-DC (LTE+NR)":"NR"})}))):a&&(M=a,l=parseInt(M[1]),!isNaN(l)&&l!==255&&(C=l===0?-140:l>=97?-44:-140+l,I=Se(C),w=M.length>4?parseInt(M[4]):255,y=0,w!==255&&!isNaN(w)&&(y=w===0?-20:w>=251?30:-20+w*.2,y=Math.min(30,Math.max(-20,y))),S=M.length>2?parseInt(M[2]):255,p=S!==255&&!isNaN(S)?S===0?-19.5:S>=34?-3:-19.5+S*.5:0,me(function(z){return o()(o()({},z),{},{rscp:C,signalPercent:I,sinr:Math.round(y),ecio:Math.round(p),sysMode:"LTE",networkMode:"LTE"})})))),A.next=7,E.sendCommand("AT^MONSC");case 7:if(T=A.sent,!(T.success&&T.data)){A.next=54;break}return F=T.data,F.includes("^MONSC:")?(V=F.replace(/^\^MONSC:\s*/,""),P=V.split(",")):P=F.split(","),O=parseInt(P[8],10),G=Se(O),A.next=15,E.sendCommand("AT^HFREQINFO?");case 15:if(H=A.sent,Z=[],Y="",!(H.success&&H.data)){A.next=54;break}if(ee=H.data.replace(/^\^HFREQINFO:\s*/,"").split(","),Z=[],!(ee.length>=9)){A.next=54;break}for(Y=ee[1],q=2;q+6<=ee.length&&Z.length<3;)J=parseInt(ee[q]),oe=Y==="7"?"n".concat(J):"B".concat(J),L=Y==="7"?rr[J.toString()]||"\u672A\u77E5\u9891\u6BB5":ar[J.toString()]||"\u672A\u77E5\u9891\u6BB5",Z.push({band:J.toString(),bandShortName:oe,bandDesc:L,dlFcn:ee[q+1].trim(),dlFreq:(parseInt(ee[q+2])*(Y==="7"?.001:.1)).toFixed(2),dlBandwidth:parseInt(ee[q+3])/1e3,ulFcn:ee[q+4].trim(),ulFreq:(parseInt(ee[q+5])*(Y==="7"?.001:.1)).toFixed(2),ulBandwidth:parseInt(ee[q+6])/1e3,sysMode:Y==="7"?"NR":"LTE"}),q+=7;if(ke=parseFloat(Z.reduce(function(z,be){return z+be.dlBandwidth},0).toFixed(2)),D=parseFloat(Z.reduce(function(z,be){return z+be.ulBandwidth},0).toFixed(2)),Q="",!(Z.length>0)){A.next=48;break}if(!(Z.some(function(z){return z.sysMode==="NR"})&&Z.some(function(z){return z.sysMode==="LTE"}))){A.next=33;break}Q="EN-DC (LTE+NR)",A.next=46;break;case 33:if(!Z.some(function(z){return z.sysMode==="NR"})){A.next=37;break}Q=Z.length>1?"NR-CA":"NR",A.next=46;break;case 37:if(!Z.some(function(z){return z.sysMode==="LTE"})){A.next=41;break}Q=Z.length>1?"LTE-CA":"LTE",A.next=46;break;case 41:return A.next=43,E.sendCommand("AT^HCSQ?");case 43:he=A.sent,we=he==null||(ue=he.data)===null||ue===void 0||(ue=ue.split(",")[0])===null||ue===void 0?void 0:ue.replace(/"/g,""),we==="NR"?Q="NR":we==="LTE"?Q="LTE":we==="WCDMA"?Q="WCDMA":Q="\u672A\u77E5";case 46:A.next=53;break;case 48:return A.next=50,E.sendCommand("AT^HCSQ?");case 50:Ie=A.sent,Fe=Ie==null||(ye=Ie.data)===null||ye===void 0||(ye=ye.split(",")[0])===null||ye===void 0?void 0:ye.replace(/"/g,""),Fe==="NR"?Q="NR":Fe==="LTE"?Q="LTE":Fe==="WCDMA"?Q="WCDMA":Q="\u672A\u77E5";case 53:me(function(z){return o()(o()({},z),{},{carrierInfo:Z,carrierCount:Z.length,dlBandwidth:ke,ulBandwidth:D,networkMode:Q,mcc:z.mcc,mnc:z.mnc,lac:z.lac,cid:z.cid,channel:z.channel,pci:z.pci,rscp:z.rscp,signalPercent:z.signalPercent,ecio:z.ecio,sinr:z.sinr})});case 54:A.next=59;break;case 56:A.prev=56,A.t0=A.catch(0),console.error("\u5237\u65B0\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",A.t0);case 59:case"end":return A.stop()}},n,null,[[0,56]])}));return function(){return f.apply(this,arguments)}}(),$=function(n){var i=typeof n=="number"?n:parseInt(n);return i>=65535||isNaN(i)||i>1500?0:parseFloat((i/10).toFixed(1))},Dr=function(){var f=k()(c()().mark(function n(){var i,d,a;return c()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return u.prev=0,u.next=3,E.sendCommand("AT^CHIPTEMP?");case 3:i=u.sent,i.success&&i.data&&(d=ve(i.data,"^CHIPTEMP","CHIPTEMP"),d&&(a=d.split(","),a.length>=12?ir({sub3GPA:$(parseInt(a[0]||"0")),sub6GPA:$(parseInt(a[1]||"0")),mimoPa:$(parseInt(a[2]||"0")),tcxo:$(parseInt(a[3]||"0")),peri1:$(parseInt(a[4]||"0")),peri2:$(parseInt(a[5]||"0")),ap1:$(parseInt(a[6]||"0")),ap2:$(parseInt(a[7]||"0")),modem1:$(parseInt(a[8]||"0")),modem2:$(parseInt(a[9]||"0")),bbp1:$(parseInt(a[10]||"0")),bbp2:$(parseInt(a[11]||"0"))}):console.warn("\u26A0\uFE0F \u6E29\u5EA6\u6570\u636E\u5B57\u6BB5\u4E0D\u8DB3:",a.length))),u.next=11;break;case 7:throw u.prev=7,u.t0=u.catch(0),console.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25:",u.t0),u.t0;case 11:case"end":return u.stop()}},n,null,[[0,7]])}));return function(){return f.apply(this,arguments)}}(),Cr=function(){var f=k()(c()().mark(function n(){var i;return c()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:jn(!0),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,yr();case 2:case"end":return s.stop()}},r)}))),le(k()(c()().mark(function r(){var u,s,t,g,v,h,x,M,l,C,I,w,y,S,p,T,F,P;return c()().wrap(function(O){for(;;)switch(O.prev=O.next){case 0:return O.next=2,E.sendCommand("AT^HCSQ?");case 2:u=O.sent,u.success&&u.data&&(s=Qe(u.data,"^HCSQ","HCSQ"),t=null,g=null,s.forEach(function(G){if(G){var H,Z=G.split(","),Y=((H=Z[0])===null||H===void 0?void 0:H.replace(/"/g,""))||"";Y==="LTE"?t=Z:Y==="NR"&&(g=Z)}}),g?(v=parseInt(g[1]),!isNaN(v)&&v!==255&&(h=v===0?-140:v>=97?-44:-140+v,x=Se(h),M=g,l=M.length>2?parseInt(M[2]):255,C=0,l!==255&&!isNaN(l)&&(C=l===0?-20:l>=251?30:-20+l*.2,C=Math.min(30,Math.max(-20,C))),me(function(G){return o()(o()({},G),{},{rscp:h,signalPercent:x,sinr:Math.round(C),sysMode:"NR"})}))):t&&(I=t,w=parseInt(I[1]),!isNaN(w)&&w!==255&&(y=w===0?-140:w>=97?-44:-140+w,S=Se(y),p=I.length>3?parseInt(I[3]):255,T=0,p!==255&&!isNaN(p)&&(T=p===0?-20:p>=251?30:-20+p*.2,T=Math.min(30,Math.max(-20,T))),F=I.length>4?parseInt(I[4]):255,P=F!==255&&!isNaN(F)?F===0?-19.5:F>=34?-3:-19.5+F*.5:0,me(function(G){return o()(o()({},G),{},{rscp:y,signalPercent:S,sinr:Math.round(T),ecio:Math.round(P),sysMode:"LTE"})}))));case 4:case"end":return O.stop()}},r)}))),le(k()(c()().mark(function r(){var u,s,t,g,v;return c()().wrap(function(x){for(;;)switch(x.prev=x.next){case 0:return x.next=2,E.sendCommand("AT^EONS=2");case 2:if(u=x.sent,!(u.success&&u.data)){x.next=23;break}if(s=ve(u.data,"^EONS","EONS"),!s){x.next=22;break}g=s.split(","),v=(t=g[1])===null||t===void 0?void 0:t.trim().replace(/"/g,""),x.t0=v,x.next=x.t0==="46000"||x.t0==="46002"||x.t0==="46004"||x.t0==="46007"||x.t0==="46008"||x.t0==="46020"?11:x.t0==="46001"||x.t0==="46006"||x.t0==="46009"?13:x.t0==="46003"||x.t0==="46005"||x.t0==="46011"?15:x.t0==="46015"?17:19;break;case 11:return fe("\u4E2D\u56FD\u79FB\u52A8"),x.abrupt("break",20);case 13:return fe("\u4E2D\u56FD\u8054\u901A"),x.abrupt("break",20);case 15:return fe("\u4E2D\u56FD\u7535\u4FE1"),x.abrupt("break",20);case 17:return fe("\u4E2D\u56FD\u5E7F\u7535"),x.abrupt("break",20);case 19:fe("\u672A\u77E5\u8FD0\u8425\u5546");case 20:x.next=23;break;case 22:fe("\u672A\u77E5\u8FD0\u8425\u5546");case 23:case"end":return x.stop()}},r)}))),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,Ne();case 2:case"end":return s.stop()}},r)}))),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,wn();case 2:case"end":return s.stop()}},r)}))),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,yn();case 2:case"end":return s.stop()}},r)}))),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,hr();case 2:case"end":return s.stop()}},r)}))),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,Oe();case 2:case"end":return s.stop()}},r)}))),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,Dr();case 2:case"end":return s.stop()}},r)}))),le(k()(c()().mark(function r(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,vn();case 2:case"end":return s.stop()}},r)}))),i=setInterval(function(){!nn.current&&en.current.length===0&&(jn(!1),clearInterval(i))},200);case 12:case"end":return a.stop()}},n)}));return function(){return f.apply(this,arguments)}}();(0,j.useEffect)(function(){var f=!1,n=E.onConnectSuccess(function(){f||(console.log("Network/Info: \u8FDE\u63A5\u6210\u529F\uFF0C\u5F00\u59CB\u52A0\u8F7D\u6570\u636E"),f=!0,Cr())}),i=function(){var d=k()(c()().mark(function a(){var r;return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.prev=0,s.next=3,E.connect();case 3:if(r=s.sent,!(r&&!f)){s.next=9;break}return console.log("Network/Info: \u8FDE\u63A5\u5DF2\u5B58\u5728\uFF0C\u76F4\u63A5\u52A0\u8F7D\u6570\u636E"),f=!0,s.next=9,Cr();case 9:s.next=14;break;case 11:s.prev=11,s.t0=s.catch(0),s.t0.message==="REQUIRE_AUTH_KEY"?console.log("Network/Info: \u7B49\u5F85\u5BC6\u94A5\u8BA4\u8BC1..."):console.error("Network/Info: \u8FDE\u63A5\u5931\u8D25:",s.t0);case 14:case"end":return s.stop()}},a,null,[[0,11]])}));return function(){return d.apply(this,arguments)}}();return i(),function(){Object.values(N).forEach(function(d){d&&clearInterval(d)}),n(),E.disconnect()}},[]);var tt=function(n){return n>=31?4:n>=21?3:n>=11?2:n>=1?1:0};(0,j.useEffect)(function(){var f=cn.S.getInstance(),n=function(d){};return f.subscribe(n),function(){f.unsubscribe(n)}},[]),(0,j.useEffect)(function(){var f=cn.S.getInstance(),n=null,i=function(){var r=k()(c()().mark(function u(s){var t,g;return c()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:if(!B.networkInfo.enabled){h.next=2;break}return h.abrupt("return");case 2:s.type==="signal_data"&&s.success&&(t=s.data,g={},t.rsrp!==void 0&&(g.rscp=t.rsrp,g.signalPercent=Se(t.rsrp)),t.sinr!==void 0&&(g.sinr=t.sinr),t.rsrq!==void 0&&(g.ecio=t.rsrq),t.rssi!==void 0&&(g.rscp=t.rssi),Object.keys(g).length>0&&me(function(x){return o()(o()({},x),g)}),n&&clearInterval(n),Je(!0),oa(0),setTimeout(k()(c()().mark(function x(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,Ne();case 2:case"end":return l.stop()}},x)})),5e3));case 3:case"end":return h.stop()}},u)}));return function(s){return r.apply(this,arguments)}}(),d=function(){var r=k()(c()().mark(function u(){return c()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,Ne();case 3:return t.next=5,wr();case 5:t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),console.error("\u6570\u636E\u5237\u65B0\u5931\u8D25:",t.t0);case 10:case"end":return t.stop()}},u,null,[[0,7]])}));return function(){return r.apply(this,arguments)}}(),a=function(){var r=k()(c()().mark(function u(){return c()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,d();case 3:return t.next=5,wn();case 5:return t.next=7,yn();case 7:return t.next=9,yr();case 9:return t.next=11,Oe();case 11:t.next=16;break;case 13:t.prev=13,t.t0=t.catch(0),console.error("\u6570\u636E\u5237\u65B0\u5931\u8D25:",t.t0);case 16:case"end":return t.stop()}},u,null,[[0,13]])}));return function(){return r.apply(this,arguments)}}();return f.subscribe(i),function(){f.unsubscribe(i),n&&clearInterval(n),Qn&&clearInterval(Qn),N.networkSpeed&&clearInterval(N.networkSpeed),N.flowStats&&clearInterval(N.flowStats),N.networkInfo&&clearInterval(N.networkInfo),N.tempMonitor&&clearInterval(N.tempMonitor)}},[]);var Se=function(n){return n>=-80?"100%":n>=-90?"90%":n>=-100?"80%":n>=-110?"50%":"25%"};return(0,e.jsxs)("div",{children:[va,(0,e.jsxs)(X.Z,{gutter:[16,16],children:[(0,e.jsx)(m.Z,{xs:24,md:24,children:(0,e.jsx)(_.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u7F51\u7EDC\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u5F53\u524D\u7F51\u7EDC\u7684\u5404\u9879\u5173\u952E\u6307\u6807"})]}),extra:(0,e.jsxs)(Re.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:B.networkInfo.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||Ce("networkInfo",!B.networkInfo.enabled,B.networkInfo.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),B.networkInfo.enabled&&(0,e.jsx)(Ue.Z,{min:1,max:60,value:B.networkInfo.interval,onChange:function(n){return Ce("networkInfo",!0,n||5)},style:{width:45},size:"small",bordered:!1}),B.networkInfo.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),className:"inner-card",children:(0,e.jsxs)(X.Z,{gutter:[16,16],children:[(0,e.jsx)(m.Z,{xs:24,lg:16,children:(0,e.jsx)(_.Z,{size:"small",title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:["\u4FE1\u53F7\u770B\u677F",b.networkMode&&(0,e.jsx)("span",{style:{fontSize:"13px",backgroundColor:b.networkMode.includes("NR")?"#52c41a":b.networkMode.includes("LTE")?"#1890ff":b.networkMode.includes("WCDMA")?"#faad14":b.networkMode.includes("GSM")?"#ff4d4f":"#999",color:"#fff",padding:"1px 6px",borderRadius:"10px",marginLeft:"8px"},children:b.networkMode}),(0,e.jsx)(Tr.Z,{color:pn.includes("\u672C\u5730")?"success":pn.includes("\u6F2B\u6E38")?"warning":"error",children:pn})]}),bordered:!0,style:{background:"var(--ant-bg-elevated)",height:"100%",border:"1px solid var(--ant-border-color-split)",boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)"},children:(0,e.jsxs)(X.Z,{gutter:[16,16],children:[(0,e.jsx)(m.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)(Ar.Z,{style:{fontSize:"32px",color:b.signalPercent==="100%"||b.signalPercent==="90%"?"#52c41a":b.signalPercent==="80%"?"#faad14":(b.signalPercent==="50%","#ff4d4f")}}),(0,e.jsx)("div",{style:{marginTop:"8px",fontWeight:"bold",color:b.signalPercent==="100%"||b.signalPercent==="90%"?"#52c41a":b.signalPercent==="80%"?"#faad14":(b.signalPercent==="50%","#ff4d4f")},children:b.signalPercent||"\u672A\u77E5"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:"\u4FE1\u53F7\u8D28\u91CF"})]})}),(0,e.jsx)(m.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.rscp>=-85?"#52c41a":b.rscp>=-95?"#faad14":"#ff4d4f"},children:b.rscp}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"RSRP (dBm)":b.networkMode.includes("WCDMA")?"RSCP (dBm)":"RSSI (dBm)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u53C2\u8003\u4FE1\u53F7\u63A5\u6536\u529F\u7387":b.networkMode.includes("WCDMA")?"\u63A5\u6536\u4FE1\u53F7\u7801\u529F\u7387":"\u63A5\u6536\u4FE1\u53F7\u5F3A\u5EA6\u6307\u793A"})]})}),(0,e.jsx)(m.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.sinr>=20?"#52c41a":b.sinr>=10?"#faad14":"#ff4d4f"},children:b.sinr}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"SINR (dB)":b.networkMode.includes("WCDMA")?"Ec/Io (dB)":"SINR (dB)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u4FE1\u566A\u6BD4":b.networkMode.includes("WCDMA")?"\u5BFC\u9891\u4FE1\u53F7\u80FD\u91CF/\u5E72\u6270\u6BD4":"\u4FE1\u566A\u6BD4"})]})}),(0,e.jsx)(m.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.networkMode.includes("LTE")?b.rssi>=-50?"#52c41a":b.rssi>=-70?"#faad14":"#ff4d4f":b.ecio>=-10?"#52c41a":b.ecio>=-15?"#faad14":"#ff4d4f"},children:b.networkMode.includes("LTE")?b.rssi:b.ecio}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("LTE")?"RSSI (dBm)":b.networkMode.includes("NR")?"RSRQ (dB)":b.networkMode.includes("WCDMA")?"ECIO (dB)":"RSSI (dBm)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("LTE")?"\u63A5\u6536\u4FE1\u53F7\u5F3A\u5EA6\u6307\u793A":b.networkMode.includes("NR")?"\u53C2\u8003\u4FE1\u53F7\u63A5\u6536\u8D28\u91CF":b.networkMode.includes("WCDMA")?"\u5BFC\u9891\u4FE1\u9053\u63A5\u6536\u8D28\u91CF":"\u63A5\u6536\u4FE1\u53F7\u5F3A\u5EA6\u6307\u793A"})]})})]})})}),(0,e.jsx)(m.Z,{xs:24,lg:8,children:(0,e.jsx)(_.Z,{size:"small",title:"\u7F51\u7EDC\u53C2\u6570",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)(X.Z,{gutter:[16,8],children:[(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"PCI:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.pci})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u9891\u70B9:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.channel})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"MCC-MNC:"}),(0,e.jsxs)("div",{style:{fontWeight:"bold"},children:[b.mcc,"-",b.mnc]})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"LAC:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.lac})]}),(0,e.jsxs)(m.Z,{span:24,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u5C0F\u533AID:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.cid})]})]})})}),(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsx)(_.Z,{type:"inner",title:(0,e.jsxs)("span",{children:["\u8F7D\u6CE2\u805A\u5408\u4FE1\u606F",b.carrierCount>0?(0,e.jsxs)("span",{style:{marginLeft:"8px",fontSize:"14px",color:"#1890ff"},children:["(",b.carrierCount,"\u8F7D\u6CE2 | \u603B\u5E26\u5BBD: \u4E0B\u884C",b.dlBandwidth,"MHz/\u4E0A\u884C",b.ulBandwidth,"MHz)"]}):(0,e.jsx)("span",{style:{marginLeft:"8px",fontSize:"14px",color:"var(--ant-text-color-secondary)"},children:"\u65E0\u8F7D\u6CE2"})]}),extra:(0,e.jsxs)(Re.ZP,{size:"small",type:"default",disabled:B.networkInfo.enabled,style:{background:B.carrierMCS.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px",color:B.networkInfo.enabled?"#d9d9d9":"#1890ff",cursor:B.networkInfo.enabled?"not-allowed":"pointer"},onClick:function(n){if(!n.target.closest(".ant-input-number")){if(B.networkInfo.enabled){ne.ZP.warning('\u8BF7\u5148\u5173\u95ED\u4E0A\u65B9"\u7F51\u7EDC\u4FE1\u606F"\u7684\u81EA\u52A8\u5237\u65B0');return}Ce("carrierMCS",!B.carrierMCS.enabled,B.carrierMCS.interval)}},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),B.carrierMCS.enabled&&(0,e.jsx)(Ue.Z,{min:1,max:60,value:B.carrierMCS.interval,onChange:function(n){return Ce("carrierMCS",!0,n||5)},style:{width:45},size:"small",bordered:!1}),B.carrierMCS.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),style:{background:"var(--ant-bg-elevated)",border:"1px solid var(--ant-border-color-split)",boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)"},children:b.carrierInfo.length>0?(0,e.jsx)("div",{children:(0,e.jsx)(X.Z,{gutter:[16,16],children:b.carrierInfo.map(function(f,n){return(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,children:(0,e.jsxs)(_.Z,{size:"small",title:(0,e.jsxs)("span",{style:{color:n===0?"#1890ff":"#666",fontWeight:n===0?"bold":"normal"},children:[n===0?"\u4E3B\u8F7D\u6CE2":"\u8F85\u8F7D\u6CE2 ".concat(n),(0,e.jsxs)("span",{style:{marginLeft:"8px",fontSize:"12px",color:f.sysMode==="NR"?"#52c41a":"#fa8c16"},children:["(",f.sysMode,")"]})]}),style:{borderLeft:n===0?"3px solid #1890ff":f.sysMode==="NR"?"3px solid #52c41a":"3px solid #fa8c16",height:"100%",boxShadow:"0 2px 8px rgba(0,0,0,0.09)"},children:[(0,e.jsxs)("div",{style:{marginBottom:"8px"},children:[(0,e.jsx)("span",{style:{fontWeight:"bold"},children:f.bandShortName}),(0,e.jsxs)("span",{style:{color:"#666",fontSize:"12px",marginLeft:"8px"},children:["(",f.bandDesc,")"]})]}),(0,e.jsxs)(X.Z,{gutter:[8,8],children:[(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u9891\u70B9:"}),(0,e.jsx)("div",{children:f.dlFcn})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u9891\u70B9:"}),(0,e.jsx)("div",{children:f.ulFcn})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u9891\u7387:"}),(0,e.jsxs)("div",{children:[f.dlFreq," MHz"]})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u9891\u7387:"}),(0,e.jsxs)("div",{children:[f.ulFreq," MHz"]})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u5E26\u5BBD:"}),(0,e.jsxs)("div",{children:[f.dlBandwidth," MHz"]})]}),(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u5E26\u5BBD:"}),(0,e.jsxs)("div",{children:[f.ulBandwidth," MHz"]})]}),(Ee==null?void 0:Ee.carriers[n])&&(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884CMCS:"}),(0,e.jsxs)("div",{style:{display:"flex",alignItems:"baseline",gap:"4px"},children:[(0,e.jsx)("span",{style:{fontSize:"16px",fontWeight:"bold",color:Ee.carriers[n].color},children:Ee.carriers[n].code0===255?"-":Ee.carriers[n].code0}),(0,e.jsx)("span",{style:{fontSize:"11px",color:"#999"},children:Ee.carriers[n].modulation})]})]})}),(Me==null?void 0:Me.carriers[n])&&(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)(m.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884CMCS:"}),(0,e.jsxs)("div",{style:{display:"flex",alignItems:"baseline",gap:"4px"},children:[(0,e.jsx)("span",{style:{fontSize:"16px",fontWeight:"bold",color:Me.carriers[n].color},children:Me.carriers[n].code0===255?"-":Me.carriers[n].code0}),(0,e.jsx)("span",{style:{fontSize:"11px",color:"#999"},children:Me.carriers[n].modulation})]})]})})]})]})},n)})})}):(0,e.jsx)("div",{style:{color:"#666",fontSize:"14px",padding:"16px 0",textAlign:"center"},children:"\u5F53\u524D\u672A\u83B7\u53D6\u5230\u8F7D\u6CE2\u4FE1\u606F\u6216\u672A\u542F\u7528\u8F7D\u6CE2\u805A\u5408"})})})]})})}),(0,e.jsx)(m.Z,{xs:24,md:12,children:(0,e.jsx)(_.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u7F51\u7EDC\u901F\u7387\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u7F51\u7EDC\u901F\u7387\u76F8\u5173\u4FE1\u606F"})]}),extra:(0,e.jsx)(Nr.Z,{checkedChildren:"\u5B9E\u65F6\u7F51\u901F\u5F00\u542F",unCheckedChildren:"\u5B9E\u65F6\u7F51\u901F\u5173\u95ED",checked:$e,onChange:ka}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)(X.Z,{gutter:[24,24],children:[(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsxs)(_.Z,{size:"small",title:"\u5B9E\u65F6\u7F51\u901F",bordered:!1,style:{background:"#f9f9f9",position:"relative"},children:[$e?null:(0,e.jsx)("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(255, 255, 255, 0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1},children:(0,e.jsx)("div",{style:{color:"#999",fontSize:"14px"},children:"\u6682\u672A\u5F00\u542F\u5B9E\u65F6\u7F51\u901F\u76D1\u63A7"})}),(0,e.jsxs)(X.Z,{gutter:[16,16],children:[(0,e.jsx)(m.Z,{xs:12,children:(0,e.jsx)(ie.Z,{title:"\u4E0A\u884C\u901F\u7387",value:re&&re.ulPdcpRate>0?an(re.ulPdcpRate):se?an(se.ulPdcpRate):"0 bps",valueStyle:{color:((re==null?void 0:re.ulPdcpRate)||(se==null?void 0:se.ulPdcpRate)||0)*8>=1e8?"#52c41a":((re==null?void 0:re.ulPdcpRate)||(se==null?void 0:se.ulPdcpRate)||0)*8>=1e7?"#1890ff":"#faad14",fontSize:"18px"}})}),(0,e.jsx)(m.Z,{xs:12,children:(0,e.jsx)(ie.Z,{title:"\u4E0B\u884C\u901F\u7387",value:re&&re.dlPdcpRate>0?an(re.dlPdcpRate):se?an(se.dlPdcpRate):"0 bps",valueStyle:{color:((re==null?void 0:re.dlPdcpRate)||(se==null?void 0:se.dlPdcpRate)||0)*8>=1e8?"#52c41a":((re==null?void 0:re.dlPdcpRate)||(se==null?void 0:se.dlPdcpRate)||0)*8>=1e7?"#1890ff":"#faad14",fontSize:"18px"}})})]})]})}),(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsx)(_.Z,{size:"small",title:"\u5F53\u524D\u7F51\u7EDC",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)(X.Z,{gutter:[16,16],children:[(0,e.jsx)(m.Z,{xs:24,sm:12,children:(0,e.jsxs)(X.Z,{gutter:[8,8],children:[(0,e.jsx)(m.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u4E0A\u884C\u901F\u7387"}),(0,e.jsxs)("div",{style:{fontSize:"16px",fontWeight:500,color:Sn>=50?"#52c41a":Sn>=25?"#faad14":"#ff4d4f"},children:[Sn," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"Mbps"})]})]})}),(0,e.jsx)(m.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u4E0B\u884C\u901F\u7387"}),(0,e.jsxs)("div",{style:{fontSize:"16px",fontWeight:500,color:bn>=100?"#52c41a":bn>=50?"#faad14":"#ff4d4f"},children:[bn," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"Mbps"})]})]})})]})}),(0,e.jsx)(m.Z,{xs:24,sm:12,children:(0,e.jsxs)(X.Z,{gutter:[8,8],children:[(0,e.jsx)(m.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u8FD0\u8425\u5546"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:Wr})]})}),(0,e.jsx)(m.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"APN"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:za||"\u672A\u77E5"})]})})]})}),(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"QCI (\u670D\u52A1\u8D28\u91CF\u7B49\u7EA7)"}),(0,e.jsxs)("div",{style:{fontSize:"14px",color:"#666"},children:[xr.split("\uFF1A")[0],(0,e.jsx)("span",{style:{marginLeft:"8px",fontSize:"12px",color:"#999"},children:xr.split("\uFF1A")[1]})]})]})})]})})})]})})}),(0,e.jsx)(m.Z,{xs:24,md:12,children:(0,e.jsx)(_.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u6D41\u91CF\u7EDF\u8BA1"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u7F51\u7EDC\u8FDE\u63A5\u65F6\u95F4\u548C\u6D41\u91CF\u4FE1\u606F"})]}),extra:(0,e.jsxs)(Br.Z,{children:[(0,e.jsx)(Re.ZP,{type:Xe?"primary":"default",onClick:function(){return ca(!Xe)},size:"small",children:Xe?"\u663E\u793A\u65F6\u5206\u79D2":"\u663E\u793A\u5929\u6570"}),(0,e.jsxs)(Re.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:B.flowStats.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||Ce("flowStats",!B.flowStats.enabled,B.flowStats.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),B.flowStats.enabled&&(0,e.jsx)(Ue.Z,{min:1,max:60,value:B.flowStats.interval,onChange:function(n){return Ce("flowStats",!0,n||5)},style:{width:45},size:"small",bordered:!1}),B.flowStats.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]})]}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)(X.Z,{gutter:[24,24],children:[(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsx)(_.Z,{size:"small",title:"\u6700\u540E\u4E00\u6B21\u8FDE\u63A5",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)(X.Z,{gutter:[24,16],children:[(0,e.jsx)(m.Z,{xs:24,sm:8,children:(0,e.jsx)(ie.Z,{title:"\u8FDE\u63A5\u65F6\u957F",value:Sr(Be.lastDsTime),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(m.Z,{xs:24,sm:8,children:(0,e.jsx)(ie.Z,{title:"\u4E0A\u4F20\u6D41\u91CF",value:rn(Be.lastTxFlow),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(m.Z,{xs:24,sm:8,children:(0,e.jsx)(ie.Z,{title:"\u4E0B\u8F7D\u6D41\u91CF",value:rn(Be.lastRxFlow),valueStyle:{fontSize:"16px"}})})]})})}),(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsx)(_.Z,{size:"small",title:"\u7D2F\u8BA1\u7EDF\u8BA1",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)(X.Z,{gutter:[24,16],children:[(0,e.jsx)(m.Z,{xs:24,sm:8,children:(0,e.jsx)(ie.Z,{title:"\u603B\u8FDE\u63A5\u65F6\u957F",value:Sr(Be.totalDsTime),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(m.Z,{xs:24,sm:8,children:(0,e.jsx)(ie.Z,{title:"\u603B\u4E0A\u4F20\u6D41\u91CF",value:rn(Be.totalTxFlow),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(m.Z,{xs:24,sm:8,children:(0,e.jsx)(ie.Z,{title:"\u603B\u4E0B\u8F7D\u6D41\u91CF",value:rn(Be.totalRxFlow),valueStyle:{fontSize:"16px"}})})]})})}),(0,e.jsx)(m.Z,{xs:24,style:{marginTop:8,textAlign:"right"},children:(0,e.jsx)(Re.ZP,{danger:!0,onClick:Ha,size:"middle",children:"\u6E05\u96F6"})})]})})}),(0,e.jsx)(m.Z,{xs:24,md:12,children:Ma()}),(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsx)(_.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"DHCP\u914D\u7F6E\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793AIPv4/IPv6\u7F51\u7EDC\u914D\u7F6E"})]}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)(X.Z,{gutter:[16,16],children:[(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsx)(_.Z,{size:"small",title:"IPv6\u80FD\u529B\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",marginBottom:"16px"},children:(0,e.jsxs)(X.Z,{gutter:[16,8],children:[(0,e.jsxs)(m.Z,{xs:24,sm:8,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u80FD\u529B\u503C"}),(0,e.jsxs)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:["0x",gn.capValue?gn.capValue.toString(16).toUpperCase().padStart(2,"0"):"00"]})]}),(0,e.jsxs)(m.Z,{xs:24,sm:16,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u80FD\u529B\u63CF\u8FF0"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:gn.description||"\u672A\u83B7\u53D6"})]})]})})}),(0,e.jsx)(m.Z,{xs:24,md:12,children:(0,e.jsx)(_.Z,{size:"small",title:"IPv4 \u7F51\u7EDC\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)(X.Z,{gutter:[16,8],children:[(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv4\u5730\u5740"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:Te.ipv4Address||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5B50\u7F51\u63A9\u7801"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:Te.subnetMask||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u7F51\u5173"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:Te.gateway||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"DHCP\u670D\u52A1\u5668"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:Te.dhcpServer||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u9996\u9009DNS"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:Te.primaryDNS||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5907\u7528DNS"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:Te.secondaryDNS||"\u672A\u83B7\u53D6"})]})]})})}),(0,e.jsx)(m.Z,{xs:24,md:12,children:(0,e.jsx)(_.Z,{size:"small",title:"IPv6 \u7F51\u7EDC\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)(X.Z,{gutter:[16,8],children:[(0,e.jsxs)(m.Z,{xs:24,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u5730\u5740"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace",wordBreak:"break-all"},children:ze.ipv6Address||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u5B50\u7F51\u63A9\u7801"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:ze.netmask||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u7F51\u5173"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:ze.gateway||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"DHCPv6\u670D\u52A1\u5668"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:ze.dhcpServer||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u9996\u9009DNSv6"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:ze.primaryDNS||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(m.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5907\u7528DNSv6"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:ze.secondaryDNS||"\u672A\u83B7\u53D6"})]})]})})})]})})}),(0,e.jsx)(m.Z,{xs:24,children:(0,e.jsx)(_.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u6A21\u7EC4\u6E29\u5EA6\u76D1\u63A7"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"5G\u6A21\u7EC4\u5404\u529F\u80FD\u6A21\u5757\u6E29\u5EA6\u72B6\u6001"})]}),extra:(0,e.jsxs)(Re.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:B.tempMonitor.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||Ce("tempMonitor",!B.tempMonitor.enabled,B.tempMonitor.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),B.tempMonitor.enabled&&(0,e.jsx)(Ue.Z,{min:1,max:60,value:B.tempMonitor.interval,onChange:function(n){return Ce("tempMonitor",!0,n||5)},style:{width:45},size:"small",bordered:!1}),B.tempMonitor.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),className:"inner-card",bodyStyle:{padding:"24px"},children:(0,e.jsxs)(X.Z,{gutter:[16,16],children:[(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(_.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(ie.Z,{title:(0,e.jsxs)("span",{children:["3G PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u529F\u653E\u6E29\u5EA6)"})]}),value:K.sub3GPA,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:K.sub3GPA<=45?"#52c41a":K.sub3GPA<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(_.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(ie.Z,{title:(0,e.jsxs)("span",{children:["6G PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u529F\u653E\u6E29\u5EA6)"})]}),value:K.sub6GPA,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:K.sub6GPA<=45?"#52c41a":K.sub6GPA<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(_.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(ie.Z,{title:(0,e.jsxs)("span",{children:["MIMO PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u591A\u5165\u591A\u51FA\u529F\u653E)"})]}),value:K.mimoPa,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:K.mimoPa<=45?"#52c41a":K.mimoPa<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(_.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(ie.Z,{title:(0,e.jsxs)("span",{children:["TCXO\u6E29\u5EA6 ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u6676\u632F\u6E29\u5EA6)"})]}),value:K.tcxo,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:K.tcxo<=45?"#52c41a":K.tcxo<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(_.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(ie.Z,{title:(0,e.jsxs)("span",{children:["AP1\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u5E94\u7528\u5904\u7406\u56681)"})]}),value:K.ap1,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:K.ap1<=45?"#52c41a":K.ap1<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(_.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(ie.Z,{title:(0,e.jsxs)("span",{children:["AP2\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u5E94\u7528\u5904\u7406\u56682)"})]}),value:K.ap2,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:K.ap2<=45?"#52c41a":K.ap2<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(m.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(_.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(ie.Z,{title:(0,e.jsxs)("span",{children:["Modem1\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u8C03\u5236\u89E3\u8C03\u56681)"})]}),value:K.modem1,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:K.modem1<=45?"#52c41a":K.modem1<=65?"#faad14":"#ff4d4f"}})})})]})})})]}),(0,e.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .network-info-card .ant-card-head-title {
          white-space: normal;
          overflow: visible;
        }
        
        .network-info-card .ant-card-extra {
          margin-left: 10px;
          white-space: normal;
        }
        
        @media (max-width: 576px) {
          .network-info-card .ant-card-extra {
            margin-left: 0;
            margin-top: 5px;
          }
          
          .inner-card .ant-card-head {
            min-height: unset;
            padding: 0 12px;
          }
          
          .inner-card .ant-card-head-title,
          .inner-card .ant-card-extra {
            padding: 8px 0;
            font-size: 14px;
          }
          
          .inner-card .ant-card-body {
            padding: 12px;
          }
          
          .ant-statistic-title {
            font-size: 12px;
          }
          
          .ant-statistic-content {
            font-size: 16px;
          }
        }
        
        .stats-card {
          background: var(--ant-card-bg);
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .stats-card:hover {
          box-shadow: 0 2px 8px var(--ant-shadow-1);
        }
        
        .stats-card .ant-card-head {
          min-height: 40px;
          padding: 0 16px;
          border-bottom: 1px solid var(--ant-border-color-split);
        }
        
        .stats-card .ant-card-head-title {
          padding: 12px 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .stats-card .ant-card-body {
          padding: 16px;
        }
        
        .stats-card .ant-statistic-title {
          margin-bottom: 8px;
          color: var(--ant-text-color-secondary);
        }
        
        .stats-card .ant-statistic-content {
          font-weight: 500;
          color: var(--ant-text-color);
        }
        
        @media (max-width: 576px) {
          .stats-card .ant-card-body {
            padding: 12px;
          }
          
          .stats-card .ant-statistic-content {
            font-size: 16px !important;
          }
        }
        
        .speed-info-card {
          background: var(--ant-card-bg);
          border-radius: 8px;
          transition: all 0.3s;
          height: 100%;
          border: 1px solid var(--ant-border-color-split);
        }
        
        .speed-info-card:hover {
          box-shadow: 0 4px 12px var(--ant-shadow-2);
          transform: translateY(-2px);
          border-color: var(--ant-primary-color);
        }
        
        .speed-info-card .ant-statistic-title {
          margin-bottom: 12px;
          color: var(--ant-text-color-secondary);
        }
        
        .speed-info-card .ant-statistic-content {
          line-height: 1.4;
          white-space: normal;
          word-break: break-all;
          color: var(--ant-text-color);
        }
        
        .speed-info-card .ant-statistic-content-suffix {
          color: var(--ant-text-color-secondary);
          font-size: 14px;
        }
        
        @media (max-width: 576px) {
          .speed-info-card {
            margin-bottom: 12px;
          }
          
          .speed-info-card .ant-statistic-content {
            font-size: 16px !important;
          }
        }
        
        .ant-input-number-handler-wrap {
          opacity: 0.5;
        }
        
        .ant-input-number:hover .ant-input-number-handler-wrap {
          opacity: 1;
        }
        
    
        
        .ant-input-number {
          background: transparent;
        }
        
        .ant-input-number-input {
          text-align: center;
          color: var(--ant-primary-color);
        }
        
        .ant-btn-text {
          color: var(--ant-text-color-secondary);
        }
        
        .ant-btn-text:hover {
          color: var(--ant-primary-color);
          background: transparent;
        }
        
        .ant-btn-link {
          color: var(--ant-primary-color);
        }
        
        .ant-btn-link:hover {
          color: var(--ant-primary-color-hover);
          background: var(--ant-primary-1);
          border-color: var(--ant-primary-color-hover);
        }
        
        .temperature-card {
          background: #ffffff;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .temperature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          border-color: #1890ff;
        }
        
        .temperature-card .ant-statistic-title {
          margin-bottom: 8px;
          color: #666;
        }
        
        .temperature-card .ant-statistic-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .temperature-card .ant-statistic-content-suffix {
          margin-left: 4px;
          font-size: 16px;
          color: #666;
        }
        
        @media (max-width: 576px) {
          .temperature-card {
            margin-bottom: 12px;
          }
          
          .temperature-card .ant-statistic-content {
            font-size: 20px !important;
          }
        }
        
        @media (max-width: 576px) {
          .ant-col-xs-12 {
            margin-bottom: 8px;
          }
          
          .ant-col-xs-12 .ant-statistic-content,
          .ant-col-xs-12 div[style*="fontSize: '22px'"] {
            font-size: 20px !important;
          }
          
          .ant-col-xs-12 div[style*="fontSize: '12px'"] {
            font-size: 11px !important;
            line-height: 1.2;
          }
        }
      `}}),(0,e.jsx)("style",{jsx:!0,global:!0,children:`
        @media screen and (max-width: 576px) {
          .signal-board-card {
            margin-bottom: 16px;
          }

          .signal-indicator {
            padding: 12px !important;
          }

          .signal-value {
            font-size: 20px !important;
          }

          .signal-unit {
            font-size: 12px !important;
          }

          .signal-title {
            font-size: 13px !important;
          }

          .signal-desc {
            font-size: 11px !important;
          }
        }
      `}),(0,e.jsx)("style",{jsx:!0,global:!0,children:`
        .network-dashboard {
          overflow: hidden;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          color: white;
          background: linear-gradient(135deg, #1a237e, #0d47a1);
        }

        .network-status {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .status-badge {
          padding: 4px 12px;
          font-weight: 600;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
        }

        .status-badge[data-mode='NR'] {
          background: #00c853;
        }

        .status-badge[data-mode='LTE'] {
          background: #2962ff;
        }

        .signal-overview {
          padding: 24px;
          background: linear-gradient(to bottom, #f5f5f5, #fff);
        }

        .signal-strength {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .signal-icon {
          color: #1a237e;
          font-size: 48px;
        }

        .signal-value {
          color: #1a237e;
          font-weight: 700;
          font-size: 36px;
        }

        .signal-metrics {
          display: flex;
          gap: 16px;
          color: #666;
          font-size: 14px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          padding: 24px;
        }

        .metric-card {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .metric-header {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
        }

        .metric-icon {
          font-size: 20px;
        }

        .metric-title {
          color: #1a237e;
          font-weight: 600;
        }

        .metric-value {
          margin-bottom: 8px;
          color: #1a237e;
          font-weight: 700;
          font-size: 28px;
        }

        .metric-unit {
          margin-left: 4px;
          color: #666;
          font-size: 14px;
        }

        .metric-desc {
          color: #666;
          font-size: 13px;
        }

        .carrier-info {
          padding: 24px;
          background: #f8f9fa;
        }

        .carrier-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          color: #1a237e;
          font-weight: 600;
        }

        .carrier-count {
          padding: 4px 12px;
          font-size: 14px;
          background: #e3f2fd;
          border-radius: 20px;
        }

        .carrier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .carrier-card {
          padding: 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .carrier-card[data-primary='true'] {
          background: linear-gradient(135deg, #e8eaf6, #fff);
          border-color: #1a237e;
        }

        .carrier-title {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #1a237e;
          font-weight: 600;
        }

        .carrier-type {
          padding: 2px 8px;
          font-size: 12px;
          background: #e3f2fd;
          border-radius: 12px;
        }

        .carrier-details {
          display: grid;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
        }

        .detail-item span {
          color: #666;
        }

        .detail-item strong {
          color: #1a237e;
        }

        @media (max-width: 576px) {
          .dashboard-header {
            padding: 12px 16px;
          }

          .signal-overview {
            padding: 16px;
          }

          .signal-icon {
            font-size: 36px;
          }

          .signal-value {
            font-size: 28px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            padding: 16px;
          }

          .metric-card {
            padding: 16px;
          }

          .carrier-info {
            padding: 16px;
          }

          .carrier-grid {
            grid-template-columns: 1fr;
          }
        }
      `}),(0,e.jsx)("style",{jsx:!0,children:`
        .network-params {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .param-item {
          padding: 12px;
          background: var(--ant-card-bg);
          border: 1px solid var(--ant-border-color-split);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .param-item:hover {
          border-color: var(--ant-primary-color);
          box-shadow: 0 2px 8px var(--ant-shadow-1);
          transform: translateY(-1px);
        }

        .param-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .param-label {
          color: var(--ant-text-color-secondary);
          font-weight: 500;
          font-size: 13px;
        }

        .param-icon {
          width: 20px;
          height: 20px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          opacity: 0.5;
        }

        .param-content {
          display: flex;
          gap: 8px;
          align-items: center;
          font-family: 'Roboto Mono', monospace;
        }

        .primary-value {
          color: var(--ant-primary-color);
          font-weight: 600;
          font-size: 15px;
        }

        .divider {
          color: var(--ant-border-color-split);
          font-size: 15px;
        }

        .secondary-value {
          color: var(--ant-text-color);
          font-weight: 600;
          font-size: 15px;
        }

        .signal-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .signal-group {
          flex: 1;
          padding: 12px;
          background: var(--ant-card-bg);
          border: 1px solid var(--ant-border-color-split);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .signal-group:hover {
          border-color: var(--ant-primary-color);
          box-shadow: 0 2px 8px var(--ant-shadow-1);
          transform: translateY(-2px);
        }

        .param-values {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 4px;
          color: var(--ant-text-color);
          font-weight: 600;
          font-size: 15px;
        }

        .param-desc {
          color: var(--ant-text-color-secondary);
          font-size: 12px;
        }

        @media (max-width: 576px) {
          .network-params {
            gap: 8px;
          }

          .param-item {
            padding: 10px;
          }

          .param-label {
            font-size: 12px;
          }

          .primary-value,
          .secondary-value,
          .divider {
            font-size: 13px;
          }

          .signal-metrics-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .signal-group {
            padding: 10px;
          }

          .param-values {
            font-size: 14px;
          }

          .param-desc {
            font-size: 11px;
          }
        }
      `}),(0,e.jsx)("style",{jsx:!0,children:`
        .signal-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .signal-group {
          flex: 1;
          padding: 12px;
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .signal-group:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .param-label {
          display: flex;
          gap: 6px;
          align-items: center;
          margin-bottom: 4px;
          color: #666;
          font-size: 13px;
        }

        .param-icon {
          font-size: 14px;
        }

        .param-values {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 4px;
          color: #1a237e;
          font-weight: 600;
          font-size: 15px;
        }

        .param-desc {
          color: #8c8c8c;
          font-size: 12px;
        }

        @media (max-width: 576px) {
          .signal-metrics-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .signal-group {
            padding: 10px;
          }

          .param-values {
            font-size: 14px;
          }

          .param-desc {
            font-size: 11px;
          }
        }
      `}),(0,e.jsx)("style",{jsx:!0,children:`
        .signal-dashboard {
          padding: 4px 0;
        }

        .signal-strength-section {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .signal-metrics {
          display: flex;
          flex: 1;
          gap: 16px;
          align-items: center;
        }

        .signal-icon-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          width: 60px;
          padding-right: 12px;
          border-right: 1px solid #f0f0f0;
        }

        .signal-percent {
          color: #262626;
          font-weight: 600;
          font-size: 14px;
        }

        .metrics-container {
          display: flex;
          flex: 1;
          gap: 12px;
          align-items: center;
          padding-left: 12px;
        }

        .metric-item {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 2px;
          align-items: center;
          padding: 4px;
          text-align: center;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .metric-item:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .metric-label {
          color: #8c8c8c;
          font-size: 12px;
        }

        .metric-value {
          font-weight: 600;
          font-size: 16px;
        }

        .metric-desc {
          max-width: 100px;
          color: #8c8c8c;
          font-size: 11px;
        }

        .carrier-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 280px;
          margin-top: 16px;
          padding: 16px;
        }

        .carrier-item {
          display: flex;
          flex-direction: column;
          padding: 12px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .carrier-header {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }

        .band-name {
          color: #1f1f1f;
          font-weight: 600;
          font-size: 14px;
        }

        .band-desc {
          margin-left: 4px;
          color: #666;
          font-size: 12px;
        }

        .freq-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .freq-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .freq-title {
          margin-bottom: 4px;
          color: #666;
          font-size: 13px;
        }

        .freq-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          align-items: center;
          padding: 6px 8px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .freq-value {
          color: #1f1f1f;
          font-size: 13px;
          font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;
          text-align: center;
        }

        .freq-value:first-child {
          text-align: left;
        }

        .freq-value:last-child {
          text-align: right;
        }

        @media (max-width: 768px) {
          .carrier-list {
            max-width: none;
          }

          .carrier-item {
            padding: 12px;
          }
        }
      `}),(0,e.jsx)("style",{jsx:!0,children:`
        .carrier-info {
          margin-top: 16px;
        }

        .carrier-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 280px;
        }

        .carrier-item {
          padding: 12px;
          background: var(--ant-card-bg);
          border-radius: 6px;
          box-shadow: 0 1px 2px var(--ant-shadow-1);
        }

        .carrier-header {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
        }

        .band-name {
          color: var(--ant-text-color);
          font-weight: 600;
          font-size: 12px;
        }

        .band-desc {
          color: var(--ant-text-color-secondary);
          font-size: 11px;
        }

        .freq-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .freq-row {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 4px 8px;
          background: var(--ant-bg-elevated);
          border-radius: 4px;
        }

        .freq-label {
          flex-shrink: 0;
          width: 32px;
          color: var(--ant-text-color-secondary);
          font-size: 11px;
        }

        .freq-value {
          color: var(--ant-text-color);
          font-size: 11px;
          font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;
        }

        .temperature-card {
          background: #ffffff;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .temperature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          border-color: #1890ff;
        }

        .temperature-value {
          color: var(--ant-text-color);
          font-size: 24px;
          font-weight: 500;
        }

        .temperature-value.normal {
          color: var(--ant-success-color);
        }

        .temperature-value.warning {
          color: var(--ant-warning-color);
        }

        .temperature-value.danger {
          color: var(--ant-error-color);
        }

        .temperature-label {
          color: var(--ant-text-color-secondary);
          font-size: 12px;
        }

        @media (max-width: 768px) {
          .carrier-list {
            max-width: none;
          }

          .carrier-item {
            padding: 12px;
          }

          .temperature-card {
            margin-bottom: 12px;
          }
        }
      `})]})};Dn.default=Zr}}]);
