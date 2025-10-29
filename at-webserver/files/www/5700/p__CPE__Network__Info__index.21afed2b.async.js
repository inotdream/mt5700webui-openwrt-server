"use strict";(self.webpackChunkant_design_pro=self.webpackChunkant_design_pro||[]).push([[92],{59650:function(da,qe,N){N.r(qe);var Gn=N(97857),d=N.n(Gn),Kn=N(15009),c=N.n(Kn),qn=N(99289),D=N.n(qn),Vn=N(5574),z=N.n(Vn),Be=N(59955),Yn=N(19693),_=N(2453),Jn=N(33900),Se=N(37804),$=N(71230),f=N(15746),W=N(36039),pe=N(77683),Xn=N(66309),er=N(72269),V=N(55054),nr=N(78957),C=N(67294),e=N(85893),rr=function(){var ar=(0,C.useState)("\u7B49\u5F85\u72B6\u6001\u4E2D"),Ve=z()(ar,2),Te=Ve[0],de=Ve[1],tr=(0,C.useState)(!1),Ye=z()(tr,2),ca=Ye[0],Je=Ye[1],sr=(0,C.useState)("\u672A\u77E5\u8FD0\u8425\u5546"),Xe=z()(sr,2),ir=Xe[0],ae=Xe[1],lr=(0,C.useState)(!1),en=z()(lr,2),pa=en[0],fa=en[1],or=(0,C.useState)({networkSpeed:{enabled:!1,interval:5},flowStats:{enabled:!1,interval:5},networkInfo:{enabled:!1,interval:5},tempMonitor:{enabled:!1,interval:5},carrierMCS:{enabled:!1,interval:5}}),nn=z()(or,2),Z=nn[0],ee=nn[1],dr=(0,C.useState)({networkSpeed:null,flowStats:null,networkInfo:null,tempMonitor:null,carrierMCS:null}),rn=z()(dr,2),R=rn[0],K=rn[1],ur=(0,C.useState)({networkSpeed:0,flowStats:0,networkInfo:0,tempMonitor:0,carrierMCS:0}),an=z()(ur,2),ma=an[0],xa=an[1],cr=(0,C.useState)({stat:0,lac:"",ci:"",act:-1}),tn=z()(cr,2),ha=tn[0],pr=tn[1],fr=(0,C.useState)(null),sn=z()(fr,2),Q=sn[0],Ne=sn[1],mr=(0,C.useState)(!1),ln=z()(mr,2),we=ln[0],Le=ln[1],xr=(0,C.useState)(500),on=z()(xr,2),hr=on[0],gr=on[1],vr=(0,C.useState)(!1),dn=z()(vr,2),br=dn[0],We=dn[1],Sr=(0,C.useState)(500),un=z()(Sr,2),Oe=un[0],cn=un[1],wr=(0,C.useState)(null),pn=z()(wr,2),q=pn[0],yr=pn[1],jr=(0,C.useState)(!1),fn=z()(jr,2),ga=fn[0],Ce=fn[1],kr=(0,C.useState)(0),mn=z()(kr,2),va=mn[0],Dr=mn[1],Cr=(0,C.useState)(null),xn=z()(Cr,2),hn=xn[0],ba=xn[1],Fr=(0,C.useState)(!1),gn=z()(Fr,2),Fe=gn[0],Mr=gn[1],Er=(0,C.useState)(null),vn=z()(Er,2),ue=vn[0],Ir=vn[1],Pr=(0,C.useState)(null),bn=z()(Pr,2),ce=bn[0],zr=bn[1],Rr=(0,C.useState)(!1),Sn=z()(Rr,2),Sa=Sn[0],wn=Sn[1],Ar=(0,C.useState)(!1),yn=z()(Ar,2),Zr=yn[0],jn=yn[1],Me=C.useRef([]),Ee=C.useRef(!1),Br=(0,C.useState)({ipv6Address:"",netmask:"",gateway:"",dhcpServer:"",primaryDNS:"",secondaryDNS:"",maxRxData:0,maxTxData:0}),kn=z()(Br,2),fe=kn[0],Tr=kn[1],Nr=(0,C.useState)({ipv4Address:"",subnetMask:"",gateway:"",dhcpServer:"",primaryDNS:"",secondaryDNS:"",maxRxData:0,maxTxData:0}),Dn=z()(Nr,2),me=Dn[0],Lr=Dn[1],Wr=(0,C.useState)({capValue:0,description:""}),Cn=z()(Wr,2),He=Cn[0],Or=Cn[1],Hr=function(){var m=D()(c()().mark(function n(i){var u;return c()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(!i){r.next=5;break}cn(hr),We(!0),r.next=15;break;case 5:return r.prev=5,r.next=8,I.setPDCPDataReport(!1);case 8:u=r.sent,u.success?(Le(!1),Ne(null),_.ZP.success("\u5173\u95ED\u5B9E\u65F6\u7F51\u901F\u6210\u529F")):_.ZP.error("\u5173\u95ED\u5B9E\u65F6\u7F51\u901F\u5931\u8D25"),r.next=15;break;case 12:r.prev=12,r.t0=r.catch(5),_.ZP.error("\u8BBE\u7F6EPDCP\u6570\u636E\u4E0A\u62A5\u5931\u8D25");case 15:case"end":return r.stop()}},n,null,[[5,12]])}));return function(i){return m.apply(this,arguments)}}(),Ur=function(){var m=D()(c()().mark(function n(){var i;return c()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,I.setPDCPDataReport(!0,Oe);case 3:i=t.sent,i.success?(Le(!0),gr(Oe),_.ZP.success("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u6210\u529F"),We(!1)):_.ZP.error("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u5931\u8D25"),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),_.ZP.error("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u5931\u8D25");case 10:case"end":return t.stop()}},n,null,[[0,7]])}));return function(){return m.apply(this,arguments)}}();(0,C.useEffect)(function(){var m=function(i){if(we&&i.type==="pdcp_data"&&"data"in i){var u=i.data;(u.ulPdcpRate>0||u.dlPdcpRate>0)&&yr(u),Ne(u)}};return I.subscribe(m),function(){I.unsubscribe(m),we&&I.setPDCPDataReport(!1).then(function(){Le(!1),Ne(null)}).catch(function(n){console.error("\u5173\u95EDPDCP\u6570\u636E\u4E0A\u62A5\u5931\u8D25:",n)})}},[we]);var $r=function(){return(0,e.jsx)(e.Fragment,{children:(0,e.jsx)(Jn.Z,{title:"\u4E3B\u52A8\u5237\u65B0\u65F6\u95F4",open:br,onOk:Ur,onCancel:function(){return We(!1)},destroyOnClose:!0,children:(0,e.jsxs)("div",{style:{padding:"20px 0"},children:[(0,e.jsx)("div",{style:{marginBottom:"10px",color:"#666"},children:"\u4E3B\u52A8\u5237\u65B0\u65F6\u95F4\uFF08200-65535ms\uFF09\uFF1A"}),(0,e.jsx)(Se.Z,{min:200,max:65535,step:100,value:Oe,onChange:function(i){return i&&cn(i)},addonAfter:"ms",style:{width:"100%"}}),(0,e.jsx)("div",{style:{marginTop:"10px",color:"#666",fontSize:"12px"},children:"\u8BF4\u660E\uFF1A\u95F4\u9694\u8D8A\u5C0F\uFF0C\u6570\u636E\u66F4\u65B0\u8D8A\u9891\u7E41\uFF0C\u4F46\u7CFB\u7EDF\u8D1F\u62C5\u8D8A\u5927"})]})})})},le=function(n,i,u){if(n==="networkInfo"){if(R.networkInfo&&(clearInterval(R.networkInfo),K(function(o){return d()(d()({},o),{},{networkInfo:null})}),Ce(!1)),i&&Z.carrierMCS.enabled&&(R.carrierMCS&&(clearInterval(R.carrierMCS),K(function(o){return d()(d()({},o),{},{carrierMCS:null})})),ee(function(o){return d()(d()({},o),{},{carrierMCS:d()(d()({},o.carrierMCS),{},{enabled:!1})})})),i){var t=function(){var o=D()(c()().mark(function y(){return c()().wrap(function(x){for(;;)switch(x.prev=x.next){case 0:try{Ce(!0),Y(D()(c()().mark(function w(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,ye();case 2:return p.next=4,Ue();case 4:case"end":return p.stop()}},w)})))}catch(w){console.error("\u5237\u65B0\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",w),_.ZP.error("\u83B7\u53D6\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25"),ee(function(j){return d()(d()({},j),{},{networkInfo:d()(d()({},j.networkInfo),{},{enabled:!1})})}),R.networkInfo&&(clearInterval(R.networkInfo),K(function(j){return d()(d()({},j),{},{networkInfo:null})})),Ce(!1)}case 1:case"end":return x.stop()}},y)}));return function(){return o.apply(this,arguments)}}();t();var r=setInterval(t,u*1e3);K(function(o){return d()(d()({},o),{},{networkInfo:r})})}ee(function(o){return d()(d()({},o),{},{networkInfo:{enabled:i,interval:u}})})}else if(n==="flowStats"){if(R.flowStats&&(clearInterval(R.flowStats),K(function(o){return d()(d()({},o),{},{flowStats:null})})),i){var S=function(){var o=D()(c()().mark(function y(){return c()().wrap(function(x){for(;;)switch(x.prev=x.next){case 0:try{Y(D()(c()().mark(function w(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,ge();case 2:case"end":return p.stop()}},w)})))}catch(w){console.error("\u5237\u65B0\u6D41\u91CF\u7EDF\u8BA1\u5931\u8D25:",w),_.ZP.error("\u5237\u65B0\u6D41\u91CF\u7EDF\u8BA1\u5931\u8D25"),ee(function(j){return d()(d()({},j),{},{flowStats:d()(d()({},j.flowStats),{},{enabled:!1})})}),R.flowStats&&(clearInterval(R.flowStats),K(function(j){return d()(d()({},j),{},{flowStats:null})}))}case 1:case"end":return x.stop()}},y)}));return function(){return o.apply(this,arguments)}}();S();var a=setInterval(S,u*1e3);K(function(o){return d()(d()({},o),{},{flowStats:a})})}ee(function(o){return d()(d()({},o),{},{flowStats:{enabled:i,interval:u}})})}else if(n==="networkSpeed"){if(R.networkSpeed&&(clearInterval(R.networkSpeed),K(function(o){return d()(d()({},o),{},{networkSpeed:null})})),i){var s=function(){var o=D()(c()().mark(function y(){return c()().wrap(function(x){for(;;)switch(x.prev=x.next){case 0:return x.prev=0,x.next=3,ge();case 3:x.next=11;break;case 5:x.prev=5,x.t0=x.catch(0),console.error("\u5237\u65B0\u7F51\u901F\u6570\u636E\u5931\u8D25:",x.t0),_.ZP.error("\u5237\u65B0\u7F51\u901F\u6570\u636E\u5931\u8D25"),ee(function(w){return d()(d()({},w),{},{networkSpeed:d()(d()({},w.networkSpeed),{},{enabled:!1})})}),R.networkSpeed&&(clearInterval(R.networkSpeed),K(function(w){return d()(d()({},w),{},{networkSpeed:null})}));case 11:case"end":return x.stop()}},y,null,[[0,5]])}));return function(){return o.apply(this,arguments)}}();s();var l=setInterval(s,u*1e3);K(function(o){return d()(d()({},o),{},{networkSpeed:l})})}ee(function(o){return d()(d()({},o),{},{networkSpeed:{enabled:i,interval:u}})})}else if(n==="tempMonitor"){if(R.tempMonitor&&(clearInterval(R.tempMonitor),K(function(o){return d()(d()({},o),{},{tempMonitor:null})})),i){var v=function(){var o=D()(c()().mark(function y(){return c()().wrap(function(x){for(;;)switch(x.prev=x.next){case 0:try{Y(D()(c()().mark(function w(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,$n();case 2:case"end":return p.stop()}},w)})))}catch(w){console.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25:",w),_.ZP.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25"),ee(function(j){return d()(d()({},j),{},{tempMonitor:d()(d()({},j.tempMonitor),{},{enabled:!1})})}),R.tempMonitor&&(clearInterval(R.tempMonitor),K(function(j){return d()(d()({},j),{},{tempMonitor:null})}))}case 1:case"end":return x.stop()}},y)}));return function(){return o.apply(this,arguments)}}();v();var P=setInterval(v,u*1e3);K(function(o){return d()(d()({},o),{},{tempMonitor:P})})}ee(function(o){return d()(d()({},o),{},{tempMonitor:{enabled:i,interval:u}})})}else if(n==="carrierMCS"){if(R.carrierMCS&&(clearInterval(R.carrierMCS),K(function(o){return d()(d()({},o),{},{carrierMCS:null})})),i){var h=function(){var o=D()(c()().mark(function y(){return c()().wrap(function(x){for(;;)switch(x.prev=x.next){case 0:try{Y(D()(c()().mark(function w(){return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,ye();case 2:return p.next=4,Ue();case 4:case"end":return p.stop()}},w)})))}catch(w){console.error("\u5237\u65B0\u8F7D\u6CE2\u805A\u5408\u548CMCS\u5931\u8D25:",w),_.ZP.error("\u5237\u65B0\u8F7D\u6CE2\u805A\u5408\u548CMCS\u5931\u8D25"),ee(function(j){return d()(d()({},j),{},{carrierMCS:d()(d()({},j.carrierMCS),{},{enabled:!1})})}),R.carrierMCS&&(clearInterval(R.carrierMCS),K(function(j){return d()(d()({},j),{},{carrierMCS:null})}))}case 1:case"end":return x.stop()}},y)}));return function(){return o.apply(this,arguments)}}();h();var M=setInterval(h,u*1e3);K(function(o){return d()(d()({},o),{},{carrierMCS:M})})}ee(function(o){return d()(d()({},o),{},{carrierMCS:{enabled:i,interval:u}})})}},Fn={1:"2100 MHz (FDD)",2:"1900 MHz (FDD)",3:"1800 MHz (FDD)",5:"850 MHz (FDD)",7:"2600 MHz (FDD)",8:"900 MHz (FDD)",20:"800 MHz (FDD)",28:"700 MHz (FDD)",38:"2600 MHz (TDD)",40:"2300 MHz (TDD)",41:"2500 MHz (TDD)",77:"3700 MHz (TDD)",78:"3500 MHz (TDD)",79:"4700 MHz (TDD)"},Mn={1:"2100 MHz (FDD)",2:"1900 MHz (FDD)",3:"1800 MHz (FDD)",5:"850 MHz (FDD)",7:"2600 MHz (FDD)",8:"900 MHz (FDD)",20:"800 MHz (FDD)",38:"2600 MHz (TDD)",40:"2300 MHz (TDD)",41:"2500 MHz (TDD)"},ye=function(){var m=D()(c()().mark(function n(){return c()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return u.abrupt("return",new Promise(function(){var t=D()(c()().mark(function r(S){var a,s,l,v,P,h,M,o,y,A,x,w,j,p,L,U,G;return c()().wrap(function(F){for(;;)switch(F.prev=F.next){case 0:return F.prev=0,F.next=3,I.sendCommand("AT^MONSC");case 3:return a=F.sent,s={},a.success&&a.data&&(l=a.data,l.includes("^MONSC:")?(P=l.replace(/^\^MONSC:\s*/,""),v=P.split(",")):v=l.split(","),v&&v.length>=9&&(s={mcc:v[1],mnc:v[2],channel:v[3],cid:parseInt(v[5],16).toString(),pci:parseInt(v[6],16),lac:parseInt(v[7],16).toString(),rscp:parseInt(v[8],10),signalPercent:ie(parseInt(v[8],10)),ecio:parseFloat(v[9])})),F.next=8,I.sendCommand("AT^HFREQINFO?");case 8:if(h=F.sent,M=[],h.success&&h.data&&(o=h.data.split(`
`),o.forEach(function(k){if(k.startsWith("^HFREQINFO:")){var E=k.replace(/^\^HFREQINFO:\s*/,"").split(",");if(E.length>=9)for(var O=E[1],g=2,J=O==="7"?3:4;g+6<=E.length&&M.length<J;){var te=parseInt(E[g]),oe=O==="7"?"n".concat(te):"B".concat(te);M.push({band:te.toString(),bandShortName:oe,bandDesc:O==="7"?Fn[te.toString()]||"\u672A\u77E5\u9891\u6BB5":Mn[te.toString()]||"\u672A\u77E5\u9891\u6BB5",dlFcn:E[g+1].trim(),dlFreq:(parseInt(E[g+2])*(O==="7"?.001:.1)).toFixed(2),dlBandwidth:parseInt(E[g+3])/1e3,ulFcn:E[g+4].trim(),ulFreq:(parseInt(E[g+5])*(O==="7"?.001:.1)).toFixed(2),ulBandwidth:parseInt(E[g+6])/1e3,sysMode:O==="7"?"NR":"LTE"}),g+=7}}})),y=parseFloat(M.reduce(function(k,E){return k+E.dlBandwidth},0).toFixed(2)),A=parseFloat(M.reduce(function(k,E){return k+E.ulBandwidth},0).toFixed(2)),x="",!(M.length>0)){F.next=34;break}if(!(M.some(function(k){return k.sysMode==="NR"})&&M.some(function(k){return k.sysMode==="LTE"}))){F.next=19;break}x="EN-DC (LTE+NR)",F.next=32;break;case 19:if(!M.some(function(k){return k.sysMode==="NR"})){F.next=23;break}x=M.length>1?"NR-CA":"NR",F.next=32;break;case 23:if(!M.some(function(k){return k.sysMode==="LTE"})){F.next=27;break}x=M.length>1?"LTE-CA":"LTE",F.next=32;break;case 27:return F.next=29,I.sendCommand("AT^HCSQ?");case 29:j=F.sent,p=j==null||(w=j.data)===null||w===void 0||(w=w.split(",")[0])===null||w===void 0?void 0:w.replace(/"/g,""),p==="NR"?x="NR":p==="LTE"?x="LTE":p==="WCDMA"?x="WCDMA":x="\u672A\u77E5";case 32:F.next=39;break;case 34:return F.next=36,I.sendCommand("AT^HCSQ?");case 36:U=F.sent,G=U==null||(L=U.data)===null||L===void 0||(L=L.split(",")[0])===null||L===void 0?void 0:L.replace(/"/g,""),G==="NR"?x="NR":G==="LTE"?x="LTE":G==="WCDMA"?x="WCDMA":x="\u672A\u77E5";case 39:se(function(k){return d()(d()(d()({},k),s),{},{carrierInfo:M,carrierCount:M.length,dlBandwidth:y,ulBandwidth:A,networkMode:x,sysMode:x})}),S(),F.next=47;break;case 43:F.prev=43,F.t0=F.catch(0),console.error("\u83B7\u53D6\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",F.t0),S();case 47:case"end":return F.stop()}},r,null,[[0,43]])}));return function(r){return t.apply(this,arguments)}}()));case 1:case"end":return u.stop()}},n)}));return function(){return m.apply(this,arguments)}}(),_r=(0,C.useState)({rscp:0,signalPercent:"",ecio:0,sinr:0,mcc:"",mnc:"",lac:"",cid:"",channel:"",band:"",dlBandwidth:0,ulBandwidth:0,pci:0,carrierInfo:[],carrierCount:0,networkMode:"",sysMode:"\u672A\u77E5"}),En=z()(_r,2),b=En[0],se=En[1],Qr=(0,C.useState)({sub3GPA:0,sub6GPA:0,mimoPa:0,tcxo:0,peri1:0,peri2:0,ap1:0,ap2:0,modem1:0,modem2:0,bbp1:0,bbp2:0}),In=z()(Qr,2),H=In[0],Pn=In[1],I=Be.S.getInstance(),Gr=function(n){return n===255?"\u672A\u4F7F\u7528":n<=9?"QPSK":n<=16?"16QAM":n<=28?"64QAM":"256QAM"},Kr=function(n){return n===255?{level:"\u672A\u4F7F\u7528",color:"#999"}:n<=9?{level:"\u5DEE",color:"#ff4d4f"}:n<=16?{level:"\u4E00\u822C",color:"#faad14"}:n<=23?{level:"\u597D",color:"#52c41a"}:{level:"\u4F18\u79C0",color:"#1890ff"}},Ue=function(){var m=D()(c()().mark(function n(){var i,u;return c()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,wn(!0),r.next=4,I.sendCommand("AT^MCS=1");case 4:return i=r.sent,i.success&&i.data&&zn(i.data,"downlink"),r.next=8,new Promise(function(S){return setTimeout(S,50)});case 8:return r.next=10,I.sendCommand("AT^MCS=0");case 10:u=r.sent,u.success&&u.data&&zn(u.data,"uplink"),r.next=17;break;case 14:r.prev=14,r.t0=r.catch(0),console.error("\u83B7\u53D6MCS\u4FE1\u606F\u5931\u8D25:",r.t0);case 17:return r.prev=17,wn(!1),r.finish(17);case 20:case"end":return r.stop()}},n,null,[[0,14,17,20]])}));return function(){return m.apply(this,arguments)}}(),zn=function(n,i){try{var u=n.split(`
`).filter(function(l){return l.includes("^MCS:")}),t=[],r="UNKNOWN";u.forEach(function(l){var v=l.match(/\^MCS:\s*(\d+),(\d+),(.+)/);if(v){var P=v[1],h=v[2],M=v[3].split(",").map(function(w){return parseInt(w.trim())});h==="1"?r="NR":h==="0"&&r==="UNKNOWN"&&(r="LTE");for(var o=0;o<M.length;o+=3)if(o+2<M.length){var y=M[o+1],A=M[o+2],x=Kr(y);t.push({index:t.length+1,mcsTableIndex:M[o],code0:y,code1:A,modulation:Gr(y),performance:x.level,color:x.color})}}});var S=t.map(function(l){return l.code0}).filter(function(l){return l!==255}),a=S.length>0?Math.round(S.reduce(function(l,v){return l+v},0)/S.length):0,s={rat:r,carriers:t,avgMCS:a};i==="downlink"?zr(s):Ir(s)}catch(l){console.error("\u89E3\u6790MCS\u6570\u636E\u5931\u8D25:",l)}},qr=function(){var m=D()(c()().mark(function n(){var i;return c()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(!Ee.current){t.next=3;break}return console.log("\u961F\u5217\u6B63\u5728\u5904\u7406\u4E2D\uFF0C\u8DF3\u8FC7\u672C\u6B21\u8C03\u7528"),t.abrupt("return");case 3:Ee.current=!0,jn(!0);case 5:if(!(Me.current.length>0)){t.next=20;break}if(i=Me.current.shift(),!i){t.next=18;break}return t.prev=8,t.next=11,i();case 11:return t.next=13,new Promise(function(r){return setTimeout(r,50)});case 13:t.next=18;break;case 15:t.prev=15,t.t0=t.catch(8),console.error("\u547D\u4EE4\u6267\u884C\u5931\u8D25:",t.t0);case 18:t.next=5;break;case 20:Ee.current=!1,jn(!1);case 22:case"end":return t.stop()}},n,null,[[8,15]])}));return function(){return m.apply(this,arguments)}}(),Y=function(n){Me.current.push(n),qr()},Vr=(0,C.useState)(""),Rn=z()(Vr,2),Yr=Rn[0],Jr=Rn[1],Xr=(0,C.useState)(0),An=z()(Xr,2),$e=An[0],ea=An[1],na=(0,C.useState)(0),Zn=z()(na,2),_e=Zn[0],ra=Zn[1],Qe=function(){var m=D()(c()().mark(function n(){var i,u,t,r,S;return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.prev=0,s.next=3,I.sendCommand("AT^DSAMBR=1");case 3:if(i=s.sent,!(!i.success||!i.data)){s.next=8;break}return s.next=7,I.sendCommand("AT^DSAMBR=8");case 7:i=s.sent;case 8:i.success&&i.data&&(u=i.data.split(","),u.length>=4&&(t=u[3].trim(),Jr(t.substring(1,t.length-1)),r=parseInt(u[1])/1e3,S=parseInt(u[2])/1e3,ea(r),ra(S))),s.next=14;break;case 11:s.prev=11,s.t0=s.catch(0),_.ZP.error("\u83B7\u53D6 AMBR \u4FE1\u606F\u5931\u8D25");case 14:case"end":return s.stop()}},n,null,[[0,11]])}));return function(){return m.apply(this,arguments)}}(),aa=(0,C.useState)("\u672A\u77E5"),Bn=z()(aa,2),Tn=Bn[0],ne=Bn[1],Ge=function(){var m=D()(c()().mark(function n(){var i,u,t,r;return c()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,a.next=3,I.sendCommand("AT+CGEQOSRDP=8");case 3:if(i=a.sent,!(!i.success||!i.data)){a.next=8;break}return a.next=7,I.sendCommand("AT+CGEQOSRDP=1");case 7:i=a.sent;case 8:if(!(i.success&&i.data)){a.next=38;break}if(u=i.data,t=u.match(/\+CGEQOSRDP:\s*\d+,(\d+)/),!(t&&t[1])){a.next=37;break}r=t[1],a.t0=r,a.next=a.t0==="1"?16:a.t0==="2"?18:a.t0==="3"?20:a.t0==="4"?22:a.t0==="5"?24:a.t0==="6"?26:a.t0==="7"?28:a.t0==="8"?30:a.t0==="9"?32:34;break;case 16:return ne("\u7B49\u7EA71\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-2,\u9AD8\u4F18\u5148\u7EA7\u8BED\u97F3\u901A\u8BDD"),a.abrupt("break",35);case 18:return ne("\u7B49\u7EA72\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF150ms,\u4E22\u5305\u738710^-3,\u6807\u51C6\u8BED\u97F3\u901A\u8BDD"),a.abrupt("break",35);case 20:return ne("\u7B49\u7EA73\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF50ms,\u4E22\u5305\u738710^-3,\u5B9E\u65F6\u6E38\u620F"),a.abrupt("break",35);case 22:return ne("\u7B49\u7EA74\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u975E\u4F1A\u8BDD\u89C6\u9891"),a.abrupt("break",35);case 24:return ne("\u7B49\u7EA75\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-6,IMS\u4FE1\u4EE4"),a.abrupt("break",35);case 26:return ne("\u7B49\u7EA76\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u89C6\u9891\u6D41\u5A92\u4F53"),a.abrupt("break",35);case 28:return ne("\u7B49\u7EA77\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-3,\u8BED\u97F3\u3001\u89C6\u9891\u3001\u4E92\u52A8\u6E38\u620F"),a.abrupt("break",35);case 30:return ne("\u7B49\u7EA78\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u89C6\u9891\u6D41\u5A92\u4F53\u3001TCP\u5E94\u7528"),a.abrupt("break",35);case 32:return ne("\u7B49\u7EA79\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u6807\u51C6\u6570\u636E\u4F20\u8F93"),a.abrupt("break",35);case 34:ne("QCI ".concat(r,"\uFF1A\u672A\u77E5\u670D\u52A1\u7B49\u7EA7"));case 35:a.next=38;break;case 37:ne("\u672A\u80FD\u83B7\u53D6\u670D\u52A1\u7B49\u7EA7\u4FE1\u606F");case 38:a.next=43;break;case 40:a.prev=40,a.t1=a.catch(0),_.ZP.error("\u83B7\u53D6\u670D\u52A1\u7B49\u7EA7\u4FE1\u606F\u5931\u8D25");case 43:case"end":return a.stop()}},n,null,[[0,40]])}));return function(){return m.apply(this,arguments)}}(),Nn=function(){var m=D()(c()().mark(function n(){var i,u,t,r,S,a,s,l,v,P,h,M,o,y,A,x,w;return c()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.prev=0,p.next=3,I.sendCommand("AT^DHCPV6?");case 3:return i=p.sent,i.success&&i.data&&(u=i.data.replace(/^\^DHCPV6:\s*/,""),t=u.split(","),t.length>=8&&Tr({ipv6Address:t[0].trim(),netmask:t[1].trim(),gateway:t[2].trim(),dhcpServer:t[3].trim(),primaryDNS:t[4].trim(),secondaryDNS:t[5].trim(),maxRxData:parseInt(t[6].trim()),maxTxData:parseInt(t[7].trim())})),p.next=7,I.sendCommand("AT^DHCP?");case 7:return r=p.sent,r.success&&r.data&&(S=r.data.replace(/^\^DHCP:\s*/,""),a=S.split(","),a.length>=8&&(s=a[0].trim(),l=a[1].trim(),v=a[2].trim(),P=a[3].trim(),h=a[4].trim(),M=a[5].trim(),o=function(U){for(var G=[],re=0;re<U.length;re+=2)G.push(parseInt(U.substr(re,2),16));return G.reverse().join(".")},Lr({ipv4Address:o(s),subnetMask:o(l),gateway:o(v),dhcpServer:o(P),primaryDNS:o(h),secondaryDNS:o(M),maxRxData:parseInt(a[6].trim()),maxTxData:parseInt(a[7].trim())}))),p.next=11,I.sendCommand("AT^IPV6CAP?");case 11:if(y=p.sent,!(y.success&&y.data)){p.next=30;break}A=y.data.replace(/^\^IPV6CAP:\s*/,""),x=parseInt(A.trim()),w="",p.t0=x,p.next=p.t0===1?19:p.t0===2?21:p.t0===7?23:p.t0===11?25:27;break;case 19:return w="\u4EC5\u652F\u6301IPv4\u534F\u8BAE",p.abrupt("break",29);case 21:return w="\u4EC5\u652F\u6301IPv6\u534F\u8BAE",p.abrupt("break",29);case 23:return w="\u652F\u6301IPv4\u3001IPv6\u548C\u53CC\u6808\u6A21\u5F0F\uFF08\u4F7F\u7528\u76F8\u540CAPN\uFF09",p.abrupt("break",29);case 25:return w="\u652F\u6301IPv4\u3001IPv6\u548C\u53CC\u6808\u6A21\u5F0F\uFF08\u4F7F\u7528\u4E0D\u540CAPN\uFF09",p.abrupt("break",29);case 27:return w="\u672A\u77E5\u80FD\u529B\u503C (0x".concat(x.toString(16).toUpperCase(),")"),p.abrupt("break",29);case 29:Or({capValue:x,description:w});case 30:p.next=35;break;case 32:p.prev=32,p.t1=p.catch(0),console.error("\u83B7\u53D6DHCP\u4FE1\u606F\u5931\u8D25:",p.t1);case 35:case"end":return p.stop()}},n,null,[[0,32]])}));return function(){return m.apply(this,arguments)}}(),ta=(0,C.useState)({lastDsTime:0,lastTxFlow:0,lastRxFlow:0,totalDsTime:0,totalTxFlow:0,totalRxFlow:0}),Ln=z()(ta,2),xe=Ln[0],sa=Ln[1],ia=(0,C.useState)({upSpeed:0,downSpeed:0,lastUpdateTime:0,lastTxFlow:0,lastRxFlow:0}),Wn=z()(ia,2),je=Wn[0],On=Wn[1],he=function(n){return parseInt(n,16)},Ie=function(n){return n<1024?"".concat(n," B"):n<1024*1024?"".concat((n/1024).toFixed(2)," KB"):n<1024*1024*1024?"".concat((n/(1024*1024)).toFixed(2)," MB"):"".concat((n/(1024*1024*1024)).toFixed(2)," GB")},Pe=function(n){var i=n*8;return i>=1e9?"".concat((i/1e9).toFixed(2)," Gbps"):i>=1e6?"".concat((i/1e6).toFixed(2)," Mbps"):i>=1e3?"".concat((i/1e3).toFixed(2)," Kbps"):"".concat(Math.round(i)," bps")},Hn=function(n){if(Fe){var i=Math.floor(n/86400),u=Math.floor(n%86400/3600),t=Math.floor(n%3600/60),r=n%60;return"".concat(i,"\u5929").concat(u,"\u65F6").concat(t,"\u5206").concat(r,"\u79D2")}else{var S=Math.floor(n/3600),a=Math.floor(n%3600/60),s=n%60;return"".concat(S,"\u65F6").concat(a,"\u5206").concat(s,"\u79D2")}},ge=function(){var m=D()(c()().mark(function n(){var i,u,t,r,S,a,s,l,v,P,h;return c()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.prev=0,o.next=3,I.sendCommand("AT^DSFLOWQRY");case 3:i=o.sent,i.success&&i.data&&(u=i.data.replace(/^\^DSFLOWQRY:\s*/,""),t=u.split(","),t.length>=6&&(r=Date.now(),S=he(t[4]),a=he(t[5]),je.lastUpdateTime>0?(s=(r-je.lastUpdateTime)/1e3,s>0&&(l=S-je.lastTxFlow,v=a-je.lastRxFlow,P=l/s,h=v/s,On({upSpeed:P,downSpeed:h,lastUpdateTime:r,lastTxFlow:S,lastRxFlow:a}))):On(d()(d()({},je),{},{lastUpdateTime:r,lastTxFlow:S,lastRxFlow:a})),sa({lastDsTime:he(t[0]),lastTxFlow:he(t[1]),lastRxFlow:he(t[2]),totalDsTime:he(t[3]),totalTxFlow:S,totalRxFlow:a}))),o.next=10;break;case 7:o.prev=7,o.t0=o.catch(0),_.ZP.error("\u83B7\u53D6\u6D41\u91CF\u7EDF\u8BA1\u4FE1\u606F\u5931\u8D25");case 10:case"end":return o.stop()}},n,null,[[0,7]])}));return function(){return m.apply(this,arguments)}}(),la=function(){var m=D()(c()().mark(function n(){var i;return c()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,I.sendCommand("AT^DSFLOWCLR");case 3:i=t.sent,i.success?(_.ZP.success("\u6D41\u91CF\u7EDF\u8BA1\u5DF2\u6E05\u96F6"),ge()):_.ZP.error("\u6D41\u91CF\u7EDF\u8BA1\u6E05\u96F6\u5931\u8D25"),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),_.ZP.error("\u6D41\u91CF\u7EDF\u8BA1\u6E05\u96F6\u5931\u8D25");case 10:case"end":return t.stop()}},n,null,[[0,7]])}));return function(){return m.apply(this,arguments)}}(),oa=function(){var m=D()(c()().mark(function n(){return c()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return u.abrupt("return",new Promise(function(){var t=D()(c()().mark(function r(S){var a,s,l,v,P,h,M,o,y,A,x,w,j,p,L,U,G,re,F,k,E;return c()().wrap(function(g){for(;;)switch(g.prev=g.next){case 0:return g.prev=0,g.next=3,I.sendCommand("AT^HCSQ?");case 3:return a=g.sent,a.success&&a.data&&(s=a.data.split(`
`),l=null,v=null,s.forEach(function(J){var te=J.replace(/^\^HCSQ:\s*/,""),oe=te.split(","),ke=oe[0].replace(/"/g,"");ke==="LTE"?l=oe:ke==="NR"&&(v=oe)}),v?(P=parseInt(v[1]),!isNaN(P)&&P!==255&&(h=P===0?-140:P>=97?-44:-140+P,M=ie(h),o=v.length>2?parseInt(v[2]):255,y=0,o!==255&&!isNaN(o)&&(y=o===0?-20:o>=251?30:-20+o*.2,y=Math.min(30,Math.max(-20,y))),se(function(J){return d()(d()({},J),{},{rscp:h,signalPercent:M,sinr:Math.round(y),sysMode:"NR"})}))):l&&(A=parseInt(l[1]),!isNaN(A)&&A!==255&&(x=A===0?-140:A>=97?-44:-140+A,w=ie(x),j=l.length>3?parseInt(l[3]):255,p=0,j!==255&&!isNaN(j)&&(p=j===0?-20:j>=251?30:-20+j*.2,p=Math.min(30,Math.max(-20,p))),L=l.length>4?parseInt(l[4]):255,U=L!==255&&!isNaN(L)?L===0?-19.5:L>=34?-3:-19.5+L*.5:0,se(function(J){return d()(d()({},J),{},{rscp:x,signalPercent:w,sinr:Math.round(p),ecio:Math.round(U),sysMode:"LTE"})})))),g.next=7,I.sendCommand("AT^EONS=2");case 7:if(G=g.sent,!(G.success&&G.data)){g.next=22;break}F=(re=G.data.split(",")[1])===null||re===void 0?void 0:re.trim(),g.t0=F,g.next=g.t0==="46000"||g.t0==="46002"||g.t0==="46004"||g.t0==="46007"||g.t0==="46008"||g.t0==="46020"?13:g.t0==="46001"||g.t0==="46006"||g.t0==="46009"?15:g.t0==="46003"||g.t0==="46005"||g.t0==="46011"?17:g.t0==="46015"?19:21;break;case 13:return ae("\u4E2D\u56FD\u79FB\u52A8"),g.abrupt("break",22);case 15:return ae("\u4E2D\u56FD\u8054\u901A"),g.abrupt("break",22);case 17:return ae("\u4E2D\u56FD\u7535\u4FE1"),g.abrupt("break",22);case 19:return ae("\u4E2D\u56FD\u5E7F\u7535"),g.abrupt("break",22);case 21:ae("\u672A\u77E5\u8FD0\u8425\u5546");case 22:return g.next=24,Qe();case 24:return g.next=26,Ge();case 26:return g.next=28,Nn();case 28:return g.next=30,ge();case 30:return g.next=32,I.sendCommand("AT^CHIPTEMP?");case 32:k=g.sent,k.success&&k.data&&(E=k.data.split(":")[1].trim().split(","),Pn({sub3GPA:parseFloat((parseInt(E[0])/10).toFixed(1)),sub6GPA:parseFloat((parseInt(E[1])/10).toFixed(1)),mimoPa:parseFloat((parseInt(E[2])/10).toFixed(1)),tcxo:parseFloat((parseInt(E[3])/10).toFixed(1)),peri1:parseFloat((parseInt(E[4])/10).toFixed(1)),peri2:parseFloat((parseInt(E[5])/10).toFixed(1)),ap1:parseFloat((parseInt(E[6])/10).toFixed(1)),ap2:parseFloat((parseInt(E[7])/10).toFixed(1)),modem1:parseFloat((parseInt(E[8])/10).toFixed(1)),modem2:parseFloat((parseInt(E[9])/10).toFixed(1)),bbp1:parseFloat((parseInt(E[10])/10).toFixed(1)),bbp2:parseFloat((parseInt(E[11])/10).toFixed(1))})),S(),g.next=41;break;case 37:g.prev=37,g.t1=g.catch(0),console.error("\u83B7\u53D6\u7F51\u7EDC\u72B6\u6001\u5931\u8D25:",g.t1),S();case 41:case"end":return g.stop()}},r,null,[[0,37]])}));return function(r){return t.apply(this,arguments)}}()));case 1:case"end":return u.stop()}},n)}));return function(){return m.apply(this,arguments)}}(),Un=function(){var m=D()(c()().mark(function n(){var i,u;return c()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,r.next=3,I.getPSRegStatus();case 3:if(i=r.sent,!(i.success&&i.data)){r.next=23;break}u=JSON.parse(i.data),pr(u),r.t0=u.stat,r.next=r.t0===0?10:r.t0===1?12:r.t0===2?14:r.t0===3?16:r.t0===4?18:r.t0===5?20:22;break;case 10:return de("\u672A\u641C\u7D22\u7F51\u7EDC"),r.abrupt("break",23);case 12:return de("\u5DF2\u6CE8\u518C\uFF0C\u672C\u5730\u7F51\u7EDC"),r.abrupt("break",23);case 14:return de("\u6B63\u5728\u641C\u7D22\u7F51\u7EDC..."),r.abrupt("break",23);case 16:return de("\u6CE8\u518C\u88AB\u62D2\u7EDD"),r.abrupt("break",23);case 18:return de("\u672A\u77E5\u72B6\u6001"),r.abrupt("break",23);case 20:return de("\u5DF2\u6CE8\u518C\uFF0C\u6F2B\u6E38\u7F51\u7EDC"),r.abrupt("break",23);case 22:de("\u672A\u77E5\u72B6\u6001");case 23:r.next=27;break;case 25:r.prev=25,r.t1=r.catch(0);case 27:case"end":return r.stop()}},n,null,[[0,25]])}));return function(){return m.apply(this,arguments)}}(),wa=function(){var m=D()(c()().mark(function n(){var i,u,t,r,S,a,s,l,v,P,h,M,o,y,A,x,w,j,p,L,U,G,re,F,k,E,O,g,J,te,oe,ke,_n,X,ve,ze,Re,be,Ae,Ze;return c()().wrap(function(B){for(;;)switch(B.prev=B.next){case 0:return B.prev=0,B.next=3,I.sendCommand("AT^HCSQ?");case 3:return i=B.sent,i.success&&i.data&&(u=i.data.split(`
`),t=null,r=null,u.forEach(function(T){var De=T.replace(/^\^HCSQ:\s*/,""),Ke=De.split(","),Qn=Ke[0].replace(/"/g,"");Qn==="LTE"?t=Ke:Qn==="NR"&&(r=Ke)}),r?(S=parseInt(r[1]),!isNaN(S)&&S!==255&&(a=S===0?-140:S>=97?-44:-140+S,s=r.length>2?parseInt(r[2]):255,l=0,s!==255&&!isNaN(s)&&(l=s===0?-20:s>=251?30:-20+s*.2,l=Math.min(30,Math.max(-20,l))),v=r.length>3?parseInt(r[3]):255,P=v!==255&&!isNaN(v)?v===0?-19.5:v>=34?-3:-19.5+v*.5:0,se(function(T){return d()(d()({},T),{},{rscp:a,signalPercent:ie(a),sinr:Math.round(l),sysMode:"NR",networkMode:t?"EN-DC (LTE+NR)":"NR"})}))):t&&(h=parseInt(t[1]),!isNaN(h)&&h!==255&&(M=h===0?-140:h>=97?-44:-140+h,o=ie(M),y=t.length>3?parseInt(t[3]):255,A=0,y!==255&&!isNaN(y)&&(A=y===0?-20:y>=251?30:-20+y*.2,A=Math.min(30,Math.max(-20,A))),x=t.length>4?parseInt(t[4]):255,w=x!==255&&!isNaN(x)?x===0?-19.5:x>=34?-3:-19.5+x*.5:0,se(function(T){return d()(d()({},T),{},{rscp:M,signalPercent:o,sinr:Math.round(A),ecio:Math.round(w),sysMode:"LTE",networkMode:"LTE"})})))),B.next=7,I.sendCommand("AT^MONSC");case 7:if(j=B.sent,!(j.success&&j.data)){B.next=54;break}return p=j.data,p.includes("^MONSC:")?(U=p.replace(/^\^MONSC:\s*/,""),L=U.split(",")):L=p.split(","),G=parseInt(L[8],10),re=ie(G),B.next=15,I.sendCommand("AT^HFREQINFO?");case 15:if(F=B.sent,k=[],E="",!(F.success&&F.data)){B.next=54;break}if(O=F.data.replace(/^\^HFREQINFO:\s*/,"").split(","),k=[],!(O.length>=9)){B.next=54;break}for(E=O[1],g=2;g+6<=O.length&&k.length<3;)J=parseInt(O[g]),te=E==="7"?"n".concat(J):"B".concat(J),oe=E==="7"?Fn[J.toString()]||"\u672A\u77E5\u9891\u6BB5":Mn[J.toString()]||"\u672A\u77E5\u9891\u6BB5",k.push({band:J.toString(),bandShortName:te,bandDesc:oe,dlFcn:O[g+1].trim(),dlFreq:(parseInt(O[g+2])*(E==="7"?.001:.1)).toFixed(2),dlBandwidth:parseInt(O[g+3])/1e3,ulFcn:O[g+4].trim(),ulFreq:(parseInt(O[g+5])*(E==="7"?.001:.1)).toFixed(2),ulBandwidth:parseInt(O[g+6])/1e3,sysMode:E==="7"?"NR":"LTE"}),g+=7;if(ke=parseFloat(k.reduce(function(T,De){return T+De.dlBandwidth},0).toFixed(2)),_n=parseFloat(k.reduce(function(T,De){return T+De.ulBandwidth},0).toFixed(2)),X="",!(k.length>0)){B.next=48;break}if(!(k.some(function(T){return T.sysMode==="NR"})&&k.some(function(T){return T.sysMode==="LTE"}))){B.next=33;break}X="EN-DC (LTE+NR)",B.next=46;break;case 33:if(!k.some(function(T){return T.sysMode==="NR"})){B.next=37;break}X=k.length>1?"NR-CA":"NR",B.next=46;break;case 37:if(!k.some(function(T){return T.sysMode==="LTE"})){B.next=41;break}X=k.length>1?"LTE-CA":"LTE",B.next=46;break;case 41:return B.next=43,I.sendCommand("AT^HCSQ?");case 43:ze=B.sent,Re=ze==null||(ve=ze.data)===null||ve===void 0||(ve=ve.split(",")[0])===null||ve===void 0?void 0:ve.replace(/"/g,""),Re==="NR"?X="NR":Re==="LTE"?X="LTE":Re==="WCDMA"?X="WCDMA":X="\u672A\u77E5";case 46:B.next=53;break;case 48:return B.next=50,I.sendCommand("AT^HCSQ?");case 50:Ae=B.sent,Ze=Ae==null||(be=Ae.data)===null||be===void 0||(be=be.split(",")[0])===null||be===void 0?void 0:be.replace(/"/g,""),Ze==="NR"?X="NR":Ze==="LTE"?X="LTE":Ze==="WCDMA"?X="WCDMA":X="\u672A\u77E5";case 53:se(function(T){return d()(d()({},T),{},{carrierInfo:k,carrierCount:k.length,dlBandwidth:ke,ulBandwidth:_n,networkMode:X,mcc:T.mcc,mnc:T.mnc,lac:T.lac,cid:T.cid,channel:T.channel,pci:T.pci,rscp:T.rscp,signalPercent:T.signalPercent,ecio:T.ecio,sinr:T.sinr})});case 54:B.next=59;break;case 56:B.prev=56,B.t0=B.catch(0),console.error("\u5237\u65B0\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",B.t0);case 59:case"end":return B.stop()}},n,null,[[0,56]])}));return function(){return m.apply(this,arguments)}}(),$n=function(){var m=D()(c()().mark(function n(){var i,u;return c()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,r.next=3,I.sendCommand("AT^CHIPTEMP?");case 3:i=r.sent,i.success&&i.data&&(u=i.data.split(":")[1].trim().split(","),Pn({sub3GPA:parseFloat((parseInt(u[0])/10).toFixed(1)),sub6GPA:parseFloat((parseInt(u[1])/10).toFixed(1)),mimoPa:parseFloat((parseInt(u[2])/10).toFixed(1)),tcxo:parseFloat((parseInt(u[3])/10).toFixed(1)),peri1:parseFloat((parseInt(u[4])/10).toFixed(1)),peri2:parseFloat((parseInt(u[5])/10).toFixed(1)),ap1:parseFloat((parseInt(u[6])/10).toFixed(1)),ap2:parseFloat((parseInt(u[7])/10).toFixed(1)),modem1:parseFloat((parseInt(u[8])/10).toFixed(1)),modem2:parseFloat((parseInt(u[9])/10).toFixed(1)),bbp1:parseFloat((parseInt(u[10])/10).toFixed(1)),bbp2:parseFloat((parseInt(u[11])/10).toFixed(1))})),r.next=11;break;case 7:throw r.prev=7,r.t0=r.catch(0),console.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25:",r.t0),r.t0;case 11:case"end":return r.stop()}},n,null,[[0,7]])}));return function(){return m.apply(this,arguments)}}();(0,C.useEffect)(function(){var m=function(){var n=D()(c()().mark(function i(){var u,t;return c()().wrap(function(S){for(;;)switch(S.prev=S.next){case 0:return S.next=2,I.connect();case 2:u=S.sent,u&&(Je(!0),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,Un();case 2:case"end":return l.stop()}},a)}))),Y(D()(c()().mark(function a(){var s,l,v,P,h,M,o,y,A,x,w,j,p,L,U,G;return c()().wrap(function(F){for(;;)switch(F.prev=F.next){case 0:return F.next=2,I.sendCommand("AT^HCSQ?");case 2:s=F.sent,s.success&&s.data&&(l=s.data.split(`
`),v=null,P=null,l.forEach(function(k){var E=k.replace(/^\^HCSQ:\s*/,""),O=E.split(","),g=O[0].replace(/"/g,"");g==="LTE"?v=O:g==="NR"&&(P=O)}),P?(h=parseInt(P[1]),!isNaN(h)&&h!==255&&(M=h===0?-140:h>=97?-44:-140+h,o=ie(M),y=P.length>2?parseInt(P[2]):255,A=0,y!==255&&!isNaN(y)&&(A=y===0?-20:y>=251?30:-20+y*.2,A=Math.min(30,Math.max(-20,A))),se(function(k){return d()(d()({},k),{},{rscp:M,signalPercent:o,sinr:Math.round(A),sysMode:"NR"})}))):v&&(x=parseInt(v[1]),!isNaN(x)&&x!==255&&(w=x===0?-140:x>=97?-44:-140+x,j=ie(w),p=v.length>3?parseInt(v[3]):255,L=0,p!==255&&!isNaN(p)&&(L=p===0?-20:p>=251?30:-20+p*.2,L=Math.min(30,Math.max(-20,L))),U=v.length>4?parseInt(v[4]):255,G=U!==255&&!isNaN(U)?U===0?-19.5:U>=34?-3:-19.5+U*.5:0,se(function(k){return d()(d()({},k),{},{rscp:w,signalPercent:j,sinr:Math.round(L),ecio:Math.round(G),sysMode:"LTE"})}))));case 4:case"end":return F.stop()}},a)}))),Y(D()(c()().mark(function a(){var s,l,v;return c()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return h.next=2,I.sendCommand("AT^EONS=2");case 2:if(s=h.sent,!(s.success&&s.data)){h.next=17;break}v=(l=s.data.split(",")[1])===null||l===void 0?void 0:l.trim(),h.t0=v,h.next=h.t0==="46000"||h.t0==="46002"||h.t0==="46004"||h.t0==="46007"||h.t0==="46008"||h.t0==="46020"?8:h.t0==="46001"||h.t0==="46006"||h.t0==="46009"?10:h.t0==="46003"||h.t0==="46005"||h.t0==="46011"?12:h.t0==="46015"?14:16;break;case 8:return ae("\u4E2D\u56FD\u79FB\u52A8"),h.abrupt("break",17);case 10:return ae("\u4E2D\u56FD\u8054\u901A"),h.abrupt("break",17);case 12:return ae("\u4E2D\u56FD\u7535\u4FE1"),h.abrupt("break",17);case 14:return ae("\u4E2D\u56FD\u5E7F\u7535"),h.abrupt("break",17);case 16:ae("\u672A\u77E5\u8FD0\u8425\u5546");case 17:case"end":return h.stop()}},a)}))),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,ye();case 2:case"end":return l.stop()}},a)}))),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,Qe();case 2:case"end":return l.stop()}},a)}))),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,Ge();case 2:case"end":return l.stop()}},a)}))),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,Nn();case 2:case"end":return l.stop()}},a)}))),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,ge();case 2:case"end":return l.stop()}},a)}))),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,$n();case 2:case"end":return l.stop()}},a)}))),Y(D()(c()().mark(function a(){return c()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,Ue();case 2:case"end":return l.stop()}},a)}))),t=setInterval(function(){!Ee.current&&Me.current.length===0&&(Je(!1),clearInterval(t))},200));case 4:case"end":return S.stop()}},i)}));return function(){return n.apply(this,arguments)}}();return m(),function(){Object.values(R).forEach(function(n){n&&clearInterval(n)}),I.disconnect()}},[]);var ya=function(n){return n>=31?4:n>=21?3:n>=11?2:n>=1?1:0};(0,C.useEffect)(function(){var m=Be.S.getInstance(),n=function(u){};return m.subscribe(n),function(){m.unsubscribe(n)}},[]),(0,C.useEffect)(function(){var m=Be.S.getInstance(),n=null,i=function(){var r=D()(c()().mark(function S(a){var s,l;return c()().wrap(function(P){for(;;)switch(P.prev=P.next){case 0:if(!Z.networkInfo.enabled){P.next=2;break}return P.abrupt("return");case 2:a.type==="signal_data"&&a.success&&(s=a.data,l={},s.rsrp!==void 0&&(l.rscp=s.rsrp,l.signalPercent=ie(s.rsrp)),s.sinr!==void 0&&(l.sinr=s.sinr),s.rsrq!==void 0&&(l.ecio=s.rsrq),s.rssi!==void 0&&(l.rscp=s.rssi),Object.keys(l).length>0&&se(function(h){return d()(d()({},h),l)}),n&&clearInterval(n),Ce(!0),Dr(0),setTimeout(D()(c()().mark(function h(){return c()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,ye();case 2:case"end":return o.stop()}},h)})),5e3));case 3:case"end":return P.stop()}},S)}));return function(a){return r.apply(this,arguments)}}(),u=function(){var r=D()(c()().mark(function S(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.prev=0,s.next=3,ye();case 3:return s.next=5,oa();case 5:s.next=10;break;case 7:s.prev=7,s.t0=s.catch(0),console.error("\u6570\u636E\u5237\u65B0\u5931\u8D25:",s.t0);case 10:case"end":return s.stop()}},S,null,[[0,7]])}));return function(){return r.apply(this,arguments)}}(),t=function(){var r=D()(c()().mark(function S(){return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.prev=0,s.next=3,u();case 3:return s.next=5,Qe();case 5:return s.next=7,Ge();case 7:return s.next=9,Un();case 9:return s.next=11,ge();case 11:s.next=16;break;case 13:s.prev=13,s.t0=s.catch(0),console.error("\u6570\u636E\u5237\u65B0\u5931\u8D25:",s.t0);case 16:case"end":return s.stop()}},S,null,[[0,13]])}));return function(){return r.apply(this,arguments)}}();return m.subscribe(i),function(){m.unsubscribe(i),n&&clearInterval(n),hn&&clearInterval(hn),R.networkSpeed&&clearInterval(R.networkSpeed),R.flowStats&&clearInterval(R.flowStats),R.networkInfo&&clearInterval(R.networkInfo),R.tempMonitor&&clearInterval(R.tempMonitor)}},[]);var ie=function(n){return n>=-80?"100%":n>=-90?"90%":n>=-100?"80%":n>=-110?"50%":"25%"};return(0,e.jsxs)("div",{children:[Zr,(0,e.jsxs)($.Z,{gutter:[16,16],children:[(0,e.jsx)(f.Z,{xs:24,md:24,children:(0,e.jsx)(W.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u7F51\u7EDC\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u5F53\u524D\u7F51\u7EDC\u7684\u5404\u9879\u5173\u952E\u6307\u6807"})]}),extra:(0,e.jsxs)(pe.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:Z.networkInfo.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||le("networkInfo",!Z.networkInfo.enabled,Z.networkInfo.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),Z.networkInfo.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:Z.networkInfo.interval,onChange:function(n){return le("networkInfo",!0,n||5)},style:{width:45},size:"small",bordered:!1}),Z.networkInfo.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),className:"inner-card",children:(0,e.jsxs)($.Z,{gutter:[16,16],children:[(0,e.jsx)(f.Z,{xs:24,lg:16,children:(0,e.jsx)(W.Z,{size:"small",title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:["\u4FE1\u53F7\u770B\u677F",b.networkMode&&(0,e.jsx)("span",{style:{fontSize:"13px",backgroundColor:b.networkMode.includes("NR")?"#52c41a":b.networkMode.includes("LTE")?"#1890ff":b.networkMode.includes("WCDMA")?"#faad14":b.networkMode.includes("GSM")?"#ff4d4f":"#999",color:"#fff",padding:"1px 6px",borderRadius:"10px",marginLeft:"8px"},children:b.networkMode}),(0,e.jsx)(Xn.Z,{color:Te.includes("\u672C\u5730")?"success":Te.includes("\u6F2B\u6E38")?"warning":"error",children:Te})]}),bordered:!0,style:{background:"var(--ant-bg-elevated)",height:"100%",border:"1px solid var(--ant-border-color-split)",boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)"},children:(0,e.jsxs)($.Z,{gutter:[16,16],children:[(0,e.jsx)(f.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)(Yn.Z,{style:{fontSize:"32px",color:b.signalPercent==="100%"||b.signalPercent==="90%"?"#52c41a":b.signalPercent==="80%"?"#faad14":(b.signalPercent==="50%","#ff4d4f")}}),(0,e.jsx)("div",{style:{marginTop:"8px",fontWeight:"bold",color:b.signalPercent==="100%"||b.signalPercent==="90%"?"#52c41a":b.signalPercent==="80%"?"#faad14":(b.signalPercent==="50%","#ff4d4f")},children:b.signalPercent||"\u672A\u77E5"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:"\u4FE1\u53F7\u8D28\u91CF"})]})}),(0,e.jsx)(f.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.rscp>=-85?"#52c41a":b.rscp>=-95?"#faad14":"#ff4d4f"},children:b.rscp}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"RSRP (dBm)":b.networkMode.includes("WCDMA")?"RSCP (dBm)":"RSSI (dBm)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u53C2\u8003\u4FE1\u53F7\u63A5\u6536\u529F\u7387":b.networkMode.includes("WCDMA")?"\u63A5\u6536\u4FE1\u53F7\u7801\u529F\u7387":"\u63A5\u6536\u4FE1\u53F7\u5F3A\u5EA6\u6307\u793A"})]})}),(0,e.jsx)(f.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.sinr>=20?"#52c41a":b.sinr>=10?"#faad14":"#ff4d4f"},children:b.sinr}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"SINR (dB)":b.networkMode.includes("WCDMA")?"Ec/Io (dB)":"SINR (dB)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u4FE1\u566A\u6BD4":b.networkMode.includes("WCDMA")?"\u5BFC\u9891\u4FE1\u53F7\u80FD\u91CF/\u5E72\u6270\u6BD4":"\u4FE1\u566A\u6BD4"})]})}),(0,e.jsx)(f.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.ecio>=-10?"#52c41a":b.ecio>=-15?"#faad14":"#ff4d4f"},children:b.ecio}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"RSRQ (dB)":b.networkMode.includes("WCDMA")?"ECIO (dB)":"RSSI (dBm)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u53C2\u8003\u4FE1\u53F7\u63A5\u6536\u8D28\u91CF":b.networkMode.includes("WCDMA")?"\u5BFC\u9891\u4FE1\u9053\u63A5\u6536\u8D28\u91CF":"\u63A5\u6536\u4FE1\u53F7\u5F3A\u5EA6\u6307\u793A"})]})})]})})}),(0,e.jsx)(f.Z,{xs:24,lg:8,children:(0,e.jsx)(W.Z,{size:"small",title:"\u7F51\u7EDC\u53C2\u6570",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)($.Z,{gutter:[16,8],children:[(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"PCI:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.pci})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u9891\u70B9:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.channel})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"MCC-MNC:"}),(0,e.jsxs)("div",{style:{fontWeight:"bold"},children:[b.mcc,"-",b.mnc]})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"LAC:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.lac})]}),(0,e.jsxs)(f.Z,{span:24,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u5C0F\u533AID:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.cid})]})]})})}),(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsx)(W.Z,{type:"inner",title:(0,e.jsxs)("span",{children:["\u8F7D\u6CE2\u805A\u5408\u4FE1\u606F",b.carrierCount>0?(0,e.jsxs)("span",{style:{marginLeft:"8px",fontSize:"14px",color:"#1890ff"},children:["(",b.carrierCount,"\u8F7D\u6CE2 | \u603B\u5E26\u5BBD: \u4E0B\u884C",b.dlBandwidth,"MHz/\u4E0A\u884C",b.ulBandwidth,"MHz)"]}):(0,e.jsx)("span",{style:{marginLeft:"8px",fontSize:"14px",color:"var(--ant-text-color-secondary)"},children:"\u65E0\u8F7D\u6CE2"})]}),extra:(0,e.jsxs)(pe.ZP,{size:"small",type:"default",disabled:Z.networkInfo.enabled,style:{background:Z.carrierMCS.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px",color:Z.networkInfo.enabled?"#d9d9d9":"#1890ff",cursor:Z.networkInfo.enabled?"not-allowed":"pointer"},onClick:function(n){if(!n.target.closest(".ant-input-number")){if(Z.networkInfo.enabled){_.ZP.warning('\u8BF7\u5148\u5173\u95ED\u4E0A\u65B9"\u7F51\u7EDC\u4FE1\u606F"\u7684\u81EA\u52A8\u5237\u65B0');return}le("carrierMCS",!Z.carrierMCS.enabled,Z.carrierMCS.interval)}},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),Z.carrierMCS.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:Z.carrierMCS.interval,onChange:function(n){return le("carrierMCS",!0,n||5)},style:{width:45},size:"small",bordered:!1}),Z.carrierMCS.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),style:{background:"var(--ant-bg-elevated)",border:"1px solid var(--ant-border-color-split)",boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)"},children:b.carrierInfo.length>0?(0,e.jsx)("div",{children:(0,e.jsx)($.Z,{gutter:[16,16],children:b.carrierInfo.map(function(m,n){return(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,children:(0,e.jsxs)(W.Z,{size:"small",title:(0,e.jsxs)("span",{style:{color:n===0?"#1890ff":"#666",fontWeight:n===0?"bold":"normal"},children:[n===0?"\u4E3B\u8F7D\u6CE2":"\u8F85\u8F7D\u6CE2 ".concat(n),(0,e.jsxs)("span",{style:{marginLeft:"8px",fontSize:"12px",color:m.sysMode==="NR"?"#52c41a":"#fa8c16"},children:["(",m.sysMode,")"]})]}),style:{borderLeft:n===0?"3px solid #1890ff":m.sysMode==="NR"?"3px solid #52c41a":"3px solid #fa8c16",height:"100%",boxShadow:"0 2px 8px rgba(0,0,0,0.09)"},children:[(0,e.jsxs)("div",{style:{marginBottom:"8px"},children:[(0,e.jsx)("span",{style:{fontWeight:"bold"},children:m.bandShortName}),(0,e.jsxs)("span",{style:{color:"#666",fontSize:"12px",marginLeft:"8px"},children:["(",m.bandDesc,")"]})]}),(0,e.jsxs)($.Z,{gutter:[8,8],children:[(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u9891\u70B9:"}),(0,e.jsx)("div",{children:m.dlFcn})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u9891\u70B9:"}),(0,e.jsx)("div",{children:m.ulFcn})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u9891\u7387:"}),(0,e.jsxs)("div",{children:[m.dlFreq," MHz"]})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u9891\u7387:"}),(0,e.jsxs)("div",{children:[m.ulFreq," MHz"]})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u5E26\u5BBD:"}),(0,e.jsxs)("div",{children:[m.dlBandwidth," MHz"]})]}),(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u5E26\u5BBD:"}),(0,e.jsxs)("div",{children:[m.ulBandwidth," MHz"]})]}),(ce==null?void 0:ce.carriers[n])&&(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884CMCS:"}),(0,e.jsxs)("div",{style:{display:"flex",alignItems:"baseline",gap:"4px"},children:[(0,e.jsx)("span",{style:{fontSize:"16px",fontWeight:"bold",color:ce.carriers[n].color},children:ce.carriers[n].code0===255?"-":ce.carriers[n].code0}),(0,e.jsx)("span",{style:{fontSize:"11px",color:"#999"},children:ce.carriers[n].modulation})]})]})}),(ue==null?void 0:ue.carriers[n])&&(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)(f.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884CMCS:"}),(0,e.jsxs)("div",{style:{display:"flex",alignItems:"baseline",gap:"4px"},children:[(0,e.jsx)("span",{style:{fontSize:"16px",fontWeight:"bold",color:ue.carriers[n].color},children:ue.carriers[n].code0===255?"-":ue.carriers[n].code0}),(0,e.jsx)("span",{style:{fontSize:"11px",color:"#999"},children:ue.carriers[n].modulation})]})]})})]})]})},n)})})}):(0,e.jsx)("div",{style:{color:"#666",fontSize:"14px",padding:"16px 0",textAlign:"center"},children:"\u5F53\u524D\u672A\u83B7\u53D6\u5230\u8F7D\u6CE2\u4FE1\u606F\u6216\u672A\u542F\u7528\u8F7D\u6CE2\u805A\u5408"})})})]})})}),(0,e.jsx)(f.Z,{xs:24,md:12,children:(0,e.jsx)(W.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u7F51\u7EDC\u901F\u7387\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u7F51\u7EDC\u901F\u7387\u76F8\u5173\u4FE1\u606F"})]}),extra:(0,e.jsx)(er.Z,{checkedChildren:"\u5B9E\u65F6\u7F51\u901F\u5F00\u542F",unCheckedChildren:"\u5B9E\u65F6\u7F51\u901F\u5173\u95ED",checked:we,onChange:Hr}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)($.Z,{gutter:[24,24],children:[(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsxs)(W.Z,{size:"small",title:"\u5B9E\u65F6\u7F51\u901F",bordered:!1,style:{background:"#f9f9f9",position:"relative"},children:[we?null:(0,e.jsx)("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(255, 255, 255, 0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1},children:(0,e.jsx)("div",{style:{color:"#999",fontSize:"14px"},children:"\u6682\u672A\u5F00\u542F\u5B9E\u65F6\u7F51\u901F\u76D1\u63A7"})}),(0,e.jsxs)($.Z,{gutter:[16,16],children:[(0,e.jsx)(f.Z,{xs:12,children:(0,e.jsx)(V.Z,{title:"\u4E0A\u884C\u901F\u7387",value:Q&&Q.ulPdcpRate>0?Pe(Q.ulPdcpRate):q?Pe(q.ulPdcpRate):"0 bps",valueStyle:{color:((Q==null?void 0:Q.ulPdcpRate)||(q==null?void 0:q.ulPdcpRate)||0)*8>=1e8?"#52c41a":((Q==null?void 0:Q.ulPdcpRate)||(q==null?void 0:q.ulPdcpRate)||0)*8>=1e7?"#1890ff":"#faad14",fontSize:"18px"}})}),(0,e.jsx)(f.Z,{xs:12,children:(0,e.jsx)(V.Z,{title:"\u4E0B\u884C\u901F\u7387",value:Q&&Q.dlPdcpRate>0?Pe(Q.dlPdcpRate):q?Pe(q.dlPdcpRate):"0 bps",valueStyle:{color:((Q==null?void 0:Q.dlPdcpRate)||(q==null?void 0:q.dlPdcpRate)||0)*8>=1e8?"#52c41a":((Q==null?void 0:Q.dlPdcpRate)||(q==null?void 0:q.dlPdcpRate)||0)*8>=1e7?"#1890ff":"#faad14",fontSize:"18px"}})})]})]})}),(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsx)(W.Z,{size:"small",title:"\u5F53\u524D\u7F51\u7EDC",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)($.Z,{gutter:[16,16],children:[(0,e.jsx)(f.Z,{xs:24,sm:12,children:(0,e.jsxs)($.Z,{gutter:[8,8],children:[(0,e.jsx)(f.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u4E0A\u884C\u901F\u7387"}),(0,e.jsxs)("div",{style:{fontSize:"16px",fontWeight:500,color:_e>=50?"#52c41a":_e>=25?"#faad14":"#ff4d4f"},children:[_e," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"Mbps"})]})]})}),(0,e.jsx)(f.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u4E0B\u884C\u901F\u7387"}),(0,e.jsxs)("div",{style:{fontSize:"16px",fontWeight:500,color:$e>=100?"#52c41a":$e>=50?"#faad14":"#ff4d4f"},children:[$e," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"Mbps"})]})]})})]})}),(0,e.jsx)(f.Z,{xs:24,sm:12,children:(0,e.jsxs)($.Z,{gutter:[8,8],children:[(0,e.jsx)(f.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u8FD0\u8425\u5546"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:ir})]})}),(0,e.jsx)(f.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"APN"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:Yr||"\u672A\u77E5"})]})})]})}),(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"QCI (\u670D\u52A1\u8D28\u91CF\u7B49\u7EA7)"}),(0,e.jsxs)("div",{style:{fontSize:"14px",color:"#666"},children:[Tn.split("\uFF1A")[0],(0,e.jsx)("span",{style:{marginLeft:"8px",fontSize:"12px",color:"#999"},children:Tn.split("\uFF1A")[1]})]})]})})]})})})]})})}),(0,e.jsx)(f.Z,{xs:24,md:12,children:(0,e.jsx)(W.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u6D41\u91CF\u7EDF\u8BA1"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u7F51\u7EDC\u8FDE\u63A5\u65F6\u95F4\u548C\u6D41\u91CF\u4FE1\u606F"})]}),extra:(0,e.jsxs)(nr.Z,{children:[(0,e.jsx)(pe.ZP,{type:Fe?"primary":"default",onClick:function(){return Mr(!Fe)},size:"small",children:Fe?"\u663E\u793A\u65F6\u5206\u79D2":"\u663E\u793A\u5929\u6570"}),(0,e.jsxs)(pe.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:Z.flowStats.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||le("flowStats",!Z.flowStats.enabled,Z.flowStats.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),Z.flowStats.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:Z.flowStats.interval,onChange:function(n){return le("flowStats",!0,n||5)},style:{width:45},size:"small",bordered:!1}),Z.flowStats.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]})]}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)($.Z,{gutter:[24,24],children:[(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsx)(W.Z,{size:"small",title:"\u6700\u540E\u4E00\u6B21\u8FDE\u63A5",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)($.Z,{gutter:[24,16],children:[(0,e.jsx)(f.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u8FDE\u63A5\u65F6\u957F",value:Hn(xe.lastDsTime),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(f.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u4E0A\u4F20\u6D41\u91CF",value:Ie(xe.lastTxFlow),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(f.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u4E0B\u8F7D\u6D41\u91CF",value:Ie(xe.lastRxFlow),valueStyle:{fontSize:"16px"}})})]})})}),(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsx)(W.Z,{size:"small",title:"\u7D2F\u8BA1\u7EDF\u8BA1",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)($.Z,{gutter:[24,16],children:[(0,e.jsx)(f.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u603B\u8FDE\u63A5\u65F6\u957F",value:Hn(xe.totalDsTime),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(f.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u603B\u4E0A\u4F20\u6D41\u91CF",value:Ie(xe.totalTxFlow),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(f.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u603B\u4E0B\u8F7D\u6D41\u91CF",value:Ie(xe.totalRxFlow),valueStyle:{fontSize:"16px"}})})]})})}),(0,e.jsx)(f.Z,{xs:24,style:{marginTop:8,textAlign:"right"},children:(0,e.jsx)(pe.ZP,{danger:!0,onClick:la,size:"middle",children:"\u6E05\u96F6"})})]})})}),(0,e.jsx)(f.Z,{xs:24,md:12,children:$r()}),(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsx)(W.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"DHCP\u914D\u7F6E\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793AIPv4/IPv6\u7F51\u7EDC\u914D\u7F6E"})]}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)($.Z,{gutter:[16,16],children:[(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsx)(W.Z,{size:"small",title:"IPv6\u80FD\u529B\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",marginBottom:"16px"},children:(0,e.jsxs)($.Z,{gutter:[16,8],children:[(0,e.jsxs)(f.Z,{xs:24,sm:8,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u80FD\u529B\u503C"}),(0,e.jsxs)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:["0x",He.capValue?He.capValue.toString(16).toUpperCase().padStart(2,"0"):"00"]})]}),(0,e.jsxs)(f.Z,{xs:24,sm:16,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u80FD\u529B\u63CF\u8FF0"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:He.description||"\u672A\u83B7\u53D6"})]})]})})}),(0,e.jsx)(f.Z,{xs:24,md:12,children:(0,e.jsx)(W.Z,{size:"small",title:"IPv4 \u7F51\u7EDC\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)($.Z,{gutter:[16,8],children:[(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv4\u5730\u5740"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.ipv4Address||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5B50\u7F51\u63A9\u7801"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.subnetMask||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u7F51\u5173"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.gateway||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"DHCP\u670D\u52A1\u5668"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.dhcpServer||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u9996\u9009DNS"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.primaryDNS||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5907\u7528DNS"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.secondaryDNS||"\u672A\u83B7\u53D6"})]})]})})}),(0,e.jsx)(f.Z,{xs:24,md:12,children:(0,e.jsx)(W.Z,{size:"small",title:"IPv6 \u7F51\u7EDC\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)($.Z,{gutter:[16,8],children:[(0,e.jsxs)(f.Z,{xs:24,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u5730\u5740"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace",wordBreak:"break-all"},children:fe.ipv6Address||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u5B50\u7F51\u63A9\u7801"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.netmask||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u7F51\u5173"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.gateway||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"DHCPv6\u670D\u52A1\u5668"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.dhcpServer||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u9996\u9009DNSv6"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.primaryDNS||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(f.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5907\u7528DNSv6"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.secondaryDNS||"\u672A\u83B7\u53D6"})]})]})})})]})})}),(0,e.jsx)(f.Z,{xs:24,children:(0,e.jsx)(W.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u6A21\u7EC4\u6E29\u5EA6\u76D1\u63A7"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"5G\u6A21\u7EC4\u5404\u529F\u80FD\u6A21\u5757\u6E29\u5EA6\u72B6\u6001"})]}),extra:(0,e.jsxs)(pe.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:Z.tempMonitor.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||le("tempMonitor",!Z.tempMonitor.enabled,Z.tempMonitor.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),Z.tempMonitor.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:Z.tempMonitor.interval,onChange:function(n){return le("tempMonitor",!0,n||5)},style:{width:45},size:"small",bordered:!1}),Z.tempMonitor.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),className:"inner-card",bodyStyle:{padding:"24px"},children:(0,e.jsxs)($.Z,{gutter:[16,16],children:[(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(W.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["3G PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u529F\u653E\u6E29\u5EA6)"})]}),value:H.sub3GPA,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:H.sub3GPA<=45?"#52c41a":H.sub3GPA<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(W.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["6G PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u529F\u653E\u6E29\u5EA6)"})]}),value:H.sub6GPA,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:H.sub6GPA<=45?"#52c41a":H.sub6GPA<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(W.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["MIMO PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u591A\u5165\u591A\u51FA\u529F\u653E)"})]}),value:H.mimoPa,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:H.mimoPa<=45?"#52c41a":H.mimoPa<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(W.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["TCXO\u6E29\u5EA6 ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u6676\u632F\u6E29\u5EA6)"})]}),value:H.tcxo,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:H.tcxo<=45?"#52c41a":H.tcxo<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(W.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["AP1\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u5E94\u7528\u5904\u7406\u56681)"})]}),value:H.ap1,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:H.ap1<=45?"#52c41a":H.ap1<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(W.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["AP2\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u5E94\u7528\u5904\u7406\u56682)"})]}),value:H.ap2,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:H.ap2<=45?"#52c41a":H.ap2<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(f.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(W.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["Modem1\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u8C03\u5236\u89E3\u8C03\u56681)"})]}),value:H.modem1,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:H.modem1<=45?"#52c41a":H.modem1<=65?"#faad14":"#ff4d4f"}})})})]})})})]}),(0,e.jsx)("style",{dangerouslySetInnerHTML:{__html:`
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
      `})]})};qe.default=rr}}]);
