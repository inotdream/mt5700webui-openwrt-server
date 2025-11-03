"use strict";(self.webpackChunkant_design_pro=self.webpackChunkant_design_pro||[]).push([[92],{59650:function(da,qe,N){N.r(qe);var Kn=N(97857),o=N.n(Kn),qn=N(15009),d=N.n(qn),Vn=N(99289),j=N.n(Vn),Yn=N(5574),P=N.n(Yn),Be=N(59955),Jn=N(19693),Q=N(2453),Xn=N(33900),Se=N(37804),U=N(71230),x=N(15746),L=N(36039),pe=N(77683),er=N(66309),nr=N(72269),V=N(55054),rr=N(78957),C=N(67294),e=N(85893),ar=function(){var tr=(0,C.useState)("\u7B49\u5F85\u72B6\u6001\u4E2D"),Ve=P()(tr,2),Te=Ve[0],ue=Ve[1],sr=(0,C.useState)(!1),Ye=P()(sr,2),pa=Ye[0],Je=Ye[1],ir=(0,C.useState)("\u672A\u77E5\u8FD0\u8425\u5546"),Xe=P()(ir,2),lr=Xe[0],ae=Xe[1],or=(0,C.useState)(!1),en=P()(or,2),fa=en[0],ma=en[1],ur=(0,C.useState)({networkSpeed:{enabled:!1,interval:5},flowStats:{enabled:!1,interval:5},networkInfo:{enabled:!1,interval:5},tempMonitor:{enabled:!1,interval:5},carrierMCS:{enabled:!1,interval:5}}),nn=P()(ur,2),R=nn[0],ne=nn[1],dr=(0,C.useState)({networkSpeed:null,flowStats:null,networkInfo:null,tempMonitor:null,carrierMCS:null}),rn=P()(dr,2),z=rn[0],G=rn[1],cr=(0,C.useState)({networkSpeed:0,flowStats:0,networkInfo:0,tempMonitor:0,carrierMCS:0}),an=P()(cr,2),xa=an[0],ha=an[1],pr=(0,C.useState)({stat:0,lac:"",ci:"",act:-1}),tn=P()(pr,2),ga=tn[0],fr=tn[1],mr=(0,C.useState)(null),sn=P()(mr,2),_=sn[0],Ne=sn[1],xr=(0,C.useState)(!1),ln=P()(xr,2),we=ln[0],Le=ln[1],hr=(0,C.useState)(500),on=P()(hr,2),gr=on[0],vr=on[1],br=(0,C.useState)(!1),un=P()(br,2),Sr=un[0],We=un[1],wr=(0,C.useState)(500),dn=P()(wr,2),Oe=dn[0],cn=dn[1],yr=(0,C.useState)(null),pn=P()(yr,2),K=pn[0],jr=pn[1],kr=(0,C.useState)(!1),fn=P()(kr,2),va=fn[0],Ce=fn[1],Dr=(0,C.useState)(0),mn=P()(Dr,2),ba=mn[0],Cr=mn[1],Fr=(0,C.useState)(null),xn=P()(Fr,2),hn=xn[0],Sa=xn[1],Mr=(0,C.useState)(!1),gn=P()(Mr,2),Fe=gn[0],Er=gn[1],Ir=(0,C.useState)(null),vn=P()(Ir,2),de=vn[0],Pr=vn[1],zr=(0,C.useState)(null),bn=P()(zr,2),ce=bn[0],Rr=bn[1],Ar=(0,C.useState)(!1),Sn=P()(Ar,2),wa=Sn[0],wn=Sn[1],Zr=(0,C.useState)(!1),yn=P()(Zr,2),Br=yn[0],jn=yn[1],Me=C.useRef([]),Ee=C.useRef(!1),Tr=(0,C.useState)({ipv6Address:"",netmask:"",gateway:"",dhcpServer:"",primaryDNS:"",secondaryDNS:"",maxRxData:0,maxTxData:0}),kn=P()(Tr,2),fe=kn[0],Nr=kn[1],Lr=(0,C.useState)({ipv4Address:"",subnetMask:"",gateway:"",dhcpServer:"",primaryDNS:"",secondaryDNS:"",maxRxData:0,maxTxData:0}),Dn=P()(Lr,2),me=Dn[0],Wr=Dn[1],Or=(0,C.useState)({capValue:0,description:""}),Cn=P()(Or,2),He=Cn[0],Hr=Cn[1],Ur=function(){var f=j()(d()().mark(function n(t){var u;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(!t){r.next=5;break}cn(gr),We(!0),r.next=15;break;case 5:return r.prev=5,r.next=8,M.setPDCPDataReport(!1);case 8:u=r.sent,u.success?(Le(!1),Ne(null),Q.ZP.success("\u5173\u95ED\u5B9E\u65F6\u7F51\u901F\u6210\u529F")):Q.ZP.error("\u5173\u95ED\u5B9E\u65F6\u7F51\u901F\u5931\u8D25"),r.next=15;break;case 12:r.prev=12,r.t0=r.catch(5),Q.ZP.error("\u8BBE\u7F6EPDCP\u6570\u636E\u4E0A\u62A5\u5931\u8D25");case 15:case"end":return r.stop()}},n,null,[[5,12]])}));return function(t){return f.apply(this,arguments)}}(),$r=function(){var f=j()(d()().mark(function n(){var t;return d()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.prev=0,s.next=3,M.setPDCPDataReport(!0,Oe);case 3:t=s.sent,t.success?(Le(!0),vr(Oe),Q.ZP.success("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u6210\u529F"),We(!1)):Q.ZP.error("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u5931\u8D25"),s.next=10;break;case 7:s.prev=7,s.t0=s.catch(0),Q.ZP.error("\u5B9E\u65F6\u7F51\u901F\u5F00\u542F\u5931\u8D25");case 10:case"end":return s.stop()}},n,null,[[0,7]])}));return function(){return f.apply(this,arguments)}}();(0,C.useEffect)(function(){var f=function(t){if(we&&t.type==="pdcp_data"&&"data"in t){var u=t.data;(u.ulPdcpRate>0||u.dlPdcpRate>0)&&jr(u),Ne(u)}};return M.subscribe(f),function(){M.unsubscribe(f),we&&M.setPDCPDataReport(!1).then(function(){Le(!1),Ne(null)}).catch(function(n){console.error("\u5173\u95EDPDCP\u6570\u636E\u4E0A\u62A5\u5931\u8D25:",n)})}},[we]);var Qr=function(){return(0,e.jsx)(e.Fragment,{children:(0,e.jsx)(Xn.Z,{title:"\u4E3B\u52A8\u5237\u65B0\u65F6\u95F4",open:Sr,onOk:$r,onCancel:function(){return We(!1)},destroyOnClose:!0,children:(0,e.jsxs)("div",{style:{padding:"20px 0"},children:[(0,e.jsx)("div",{style:{marginBottom:"10px",color:"#666"},children:"\u4E3B\u52A8\u5237\u65B0\u65F6\u95F4\uFF08200-65535ms\uFF09\uFF1A"}),(0,e.jsx)(Se.Z,{min:200,max:65535,step:100,value:Oe,onChange:function(t){return t&&cn(t)},addonAfter:"ms",style:{width:"100%"}}),(0,e.jsx)("div",{style:{marginTop:"10px",color:"#666",fontSize:"12px"},children:"\u8BF4\u660E\uFF1A\u95F4\u9694\u8D8A\u5C0F\uFF0C\u6570\u636E\u66F4\u65B0\u8D8A\u9891\u7E41\uFF0C\u4F46\u7CFB\u7EDF\u8D1F\u62C5\u8D8A\u5927"})]})})})},le=function(n,t,u){if(n==="networkInfo"){if(z.networkInfo&&(clearInterval(z.networkInfo),G(function(i){return o()(o()({},i),{},{networkInfo:null})}),Ce(!1)),t&&R.carrierMCS.enabled&&(z.carrierMCS&&(clearInterval(z.carrierMCS),G(function(i){return o()(o()({},i),{},{carrierMCS:null})})),ne(function(i){return o()(o()({},i),{},{carrierMCS:o()(o()({},i.carrierMCS),{},{enabled:!1})})})),t){var s=function(){var i=j()(d()().mark(function y(){return d()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:try{Ce(!0),Y(j()(d()().mark(function S(){return d()().wrap(function(m){for(;;)switch(m.prev=m.next){case 0:return m.next=2,ye();case 2:return m.next=4,Ue();case 4:case"end":return m.stop()}},S)})))}catch(S){console.error("\u5237\u65B0\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",S),Q.ZP.error("\u83B7\u53D6\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25"),ne(function(w){return o()(o()({},w),{},{networkInfo:o()(o()({},w.networkInfo),{},{enabled:!1})})}),z.networkInfo&&(clearInterval(z.networkInfo),G(function(w){return o()(o()({},w),{},{networkInfo:null})})),Ce(!1)}case 1:case"end":return h.stop()}},y)}));return function(){return i.apply(this,arguments)}}();s();var r=setInterval(s,u*1e3);G(function(i){return o()(o()({},i),{},{networkInfo:r})})}ne(function(i){return o()(o()({},i),{},{networkInfo:{enabled:t,interval:u}})})}else if(n==="flowStats"){if(z.flowStats&&(clearInterval(z.flowStats),G(function(i){return o()(o()({},i),{},{flowStats:null})})),t){var c=function(){var i=j()(d()().mark(function y(){return d()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:try{Y(j()(d()().mark(function S(){return d()().wrap(function(m){for(;;)switch(m.prev=m.next){case 0:return m.next=2,ge();case 2:case"end":return m.stop()}},S)})))}catch(S){console.error("\u5237\u65B0\u6D41\u91CF\u7EDF\u8BA1\u5931\u8D25:",S),Q.ZP.error("\u5237\u65B0\u6D41\u91CF\u7EDF\u8BA1\u5931\u8D25"),ne(function(w){return o()(o()({},w),{},{flowStats:o()(o()({},w.flowStats),{},{enabled:!1})})}),z.flowStats&&(clearInterval(z.flowStats),G(function(w){return o()(o()({},w),{},{flowStats:null})}))}case 1:case"end":return h.stop()}},y)}));return function(){return i.apply(this,arguments)}}();c();var a=setInterval(c,u*1e3);G(function(i){return o()(o()({},i),{},{flowStats:a})})}ne(function(i){return o()(o()({},i),{},{flowStats:{enabled:t,interval:u}})})}else if(n==="networkSpeed"){if(z.networkSpeed&&(clearInterval(z.networkSpeed),G(function(i){return o()(o()({},i),{},{networkSpeed:null})})),t){var l=function(){var i=j()(d()().mark(function y(){return d()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return h.prev=0,h.next=3,ge();case 3:h.next=11;break;case 5:h.prev=5,h.t0=h.catch(0),console.error("\u5237\u65B0\u7F51\u901F\u6570\u636E\u5931\u8D25:",h.t0),Q.ZP.error("\u5237\u65B0\u7F51\u901F\u6570\u636E\u5931\u8D25"),ne(function(S){return o()(o()({},S),{},{networkSpeed:o()(o()({},S.networkSpeed),{},{enabled:!1})})}),z.networkSpeed&&(clearInterval(z.networkSpeed),G(function(S){return o()(o()({},S),{},{networkSpeed:null})}));case 11:case"end":return h.stop()}},y,null,[[0,5]])}));return function(){return i.apply(this,arguments)}}();l();var v=setInterval(l,u*1e3);G(function(i){return o()(o()({},i),{},{networkSpeed:v})})}ne(function(i){return o()(o()({},i),{},{networkSpeed:{enabled:t,interval:u}})})}else if(n==="tempMonitor"){if(z.tempMonitor&&(clearInterval(z.tempMonitor),G(function(i){return o()(o()({},i),{},{tempMonitor:null})})),t){var p=function(){var i=j()(d()().mark(function y(){return d()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:try{Y(j()(d()().mark(function S(){return d()().wrap(function(m){for(;;)switch(m.prev=m.next){case 0:return m.next=2,$n();case 2:case"end":return m.stop()}},S)})))}catch(S){console.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25:",S),Q.ZP.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25"),ne(function(w){return o()(o()({},w),{},{tempMonitor:o()(o()({},w.tempMonitor),{},{enabled:!1})})}),z.tempMonitor&&(clearInterval(z.tempMonitor),G(function(w){return o()(o()({},w),{},{tempMonitor:null})}))}case 1:case"end":return h.stop()}},y)}));return function(){return i.apply(this,arguments)}}();p();var A=setInterval(p,u*1e3);G(function(i){return o()(o()({},i),{},{tempMonitor:A})})}ne(function(i){return o()(o()({},i),{},{tempMonitor:{enabled:t,interval:u}})})}else if(n==="carrierMCS"){if(z.carrierMCS&&(clearInterval(z.carrierMCS),G(function(i){return o()(o()({},i),{},{carrierMCS:null})})),t){var I=function(){var i=j()(d()().mark(function y(){return d()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:try{Y(j()(d()().mark(function S(){return d()().wrap(function(m){for(;;)switch(m.prev=m.next){case 0:return m.next=2,ye();case 2:return m.next=4,Ue();case 4:case"end":return m.stop()}},S)})))}catch(S){console.error("\u5237\u65B0\u8F7D\u6CE2\u805A\u5408\u548CMCS\u5931\u8D25:",S),Q.ZP.error("\u5237\u65B0\u8F7D\u6CE2\u805A\u5408\u548CMCS\u5931\u8D25"),ne(function(w){return o()(o()({},w),{},{carrierMCS:o()(o()({},w.carrierMCS),{},{enabled:!1})})}),z.carrierMCS&&(clearInterval(z.carrierMCS),G(function(w){return o()(o()({},w),{},{carrierMCS:null})}))}case 1:case"end":return h.stop()}},y)}));return function(){return i.apply(this,arguments)}}();I();var k=setInterval(I,u*1e3);G(function(i){return o()(o()({},i),{},{carrierMCS:k})})}ne(function(i){return o()(o()({},i),{},{carrierMCS:{enabled:t,interval:u}})})}},Fn={1:"2100 MHz (FDD)",2:"1900 MHz (FDD)",3:"1800 MHz (FDD)",5:"850 MHz (FDD)",7:"2600 MHz (FDD)",8:"900 MHz (FDD)",20:"800 MHz (FDD)",28:"700 MHz (FDD)",38:"2600 MHz (TDD)",40:"2300 MHz (TDD)",41:"2500 MHz (TDD)",77:"3700 MHz (TDD)",78:"3500 MHz (TDD)",79:"4700 MHz (TDD)"},Mn={1:"2100 MHz (FDD)",2:"1900 MHz (FDD)",3:"1800 MHz (FDD)",5:"850 MHz (FDD)",7:"2600 MHz (FDD)",8:"900 MHz (FDD)",20:"800 MHz (FDD)",38:"2600 MHz (TDD)",40:"2300 MHz (TDD)",41:"2500 MHz (TDD)"},ye=function(){var f=j()(d()().mark(function n(){return d()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return u.abrupt("return",new Promise(function(){var s=j()(d()().mark(function r(c){var a,l,v,p,A,I,k,i,y,B,h,S,w,m,O,J,H;return d()().wrap(function(E){for(;;)switch(E.prev=E.next){case 0:return E.prev=0,E.next=3,M.sendCommand("AT^MONSC");case 3:return a=E.sent,l={},a.success&&a.data&&(v=a.data,v.includes("^MONSC:")?(A=v.replace(/^\^MONSC:\s*/,""),p=A.split(",")):p=v.split(","),p&&p.length>=9&&(l={mcc:p[1],mnc:p[2],channel:p[3],cid:parseInt(p[5],16).toString(),pci:parseInt(p[6],16),lac:parseInt(p[7],16).toString(),rscp:parseInt(p[8],10),signalPercent:ie(parseInt(p[8],10)),ecio:parseFloat(p[9])})),E.next=8,M.sendCommand("AT^HFREQINFO?");case 8:if(I=E.sent,k=[],I.success&&I.data&&(i=I.data.split(`
`),i.forEach(function(D){if(D.startsWith("^HFREQINFO:")){var F=D.replace(/^\^HFREQINFO:\s*/,"").split(",");if(F.length>=9)for(var $=F[1],g=2,X=$==="7"?3:4;g+6<=F.length&&k.length<X;){var te=parseInt(F[g]),oe=$==="7"?"n".concat(te):"B".concat(te);k.push({band:te.toString(),bandShortName:oe,bandDesc:$==="7"?Fn[te.toString()]||"\u672A\u77E5\u9891\u6BB5":Mn[te.toString()]||"\u672A\u77E5\u9891\u6BB5",dlFcn:F[g+1].trim(),dlFreq:(parseInt(F[g+2])*($==="7"?.001:.1)).toFixed(2),dlBandwidth:parseInt(F[g+3])/1e3,ulFcn:F[g+4].trim(),ulFreq:(parseInt(F[g+5])*($==="7"?.001:.1)).toFixed(2),ulBandwidth:parseInt(F[g+6])/1e3,sysMode:$==="7"?"NR":"LTE"}),g+=7}}})),y=parseFloat(k.reduce(function(D,F){return D+F.dlBandwidth},0).toFixed(2)),B=parseFloat(k.reduce(function(D,F){return D+F.ulBandwidth},0).toFixed(2)),h="",!(k.length>0)){E.next=34;break}if(!(k.some(function(D){return D.sysMode==="NR"})&&k.some(function(D){return D.sysMode==="LTE"}))){E.next=19;break}h="EN-DC (LTE+NR)",E.next=32;break;case 19:if(!k.some(function(D){return D.sysMode==="NR"})){E.next=23;break}h=k.length>1?"NR-CA":"NR",E.next=32;break;case 23:if(!k.some(function(D){return D.sysMode==="LTE"})){E.next=27;break}h=k.length>1?"LTE-CA":"LTE",E.next=32;break;case 27:return E.next=29,M.sendCommand("AT^HCSQ?");case 29:w=E.sent,m=w==null||(S=w.data)===null||S===void 0||(S=S.split(",")[0])===null||S===void 0?void 0:S.replace(/"/g,""),m==="NR"?h="NR":m==="LTE"?h="LTE":m==="WCDMA"?h="WCDMA":h="\u672A\u77E5";case 32:E.next=39;break;case 34:return E.next=36,M.sendCommand("AT^HCSQ?");case 36:J=E.sent,H=J==null||(O=J.data)===null||O===void 0||(O=O.split(",")[0])===null||O===void 0?void 0:O.replace(/"/g,""),H==="NR"?h="NR":H==="LTE"?h="LTE":H==="WCDMA"?h="WCDMA":h="\u672A\u77E5";case 39:se(function(D){return o()(o()(o()({},D),l),{},{carrierInfo:k,carrierCount:k.length,dlBandwidth:y,ulBandwidth:B,networkMode:h,sysMode:h})}),c(),E.next=47;break;case 43:E.prev=43,E.t0=E.catch(0),console.error("\u83B7\u53D6\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",E.t0),c();case 47:case"end":return E.stop()}},r,null,[[0,43]])}));return function(r){return s.apply(this,arguments)}}()));case 1:case"end":return u.stop()}},n)}));return function(){return f.apply(this,arguments)}}(),_r=(0,C.useState)({rscp:0,signalPercent:"",ecio:0,sinr:0,mcc:"",mnc:"",lac:"",cid:"",channel:"",band:"",dlBandwidth:0,ulBandwidth:0,pci:0,carrierInfo:[],carrierCount:0,networkMode:"",sysMode:"\u672A\u77E5"}),En=P()(_r,2),b=En[0],se=En[1],Gr=(0,C.useState)({sub3GPA:0,sub6GPA:0,mimoPa:0,tcxo:0,peri1:0,peri2:0,ap1:0,ap2:0,modem1:0,modem2:0,bbp1:0,bbp2:0}),In=P()(Gr,2),W=In[0],Pn=In[1],M=Be.S.getInstance(),Kr=function(n){return n===255?"\u672A\u4F7F\u7528":n<=9?"QPSK":n<=16?"16QAM":n<=28?"64QAM":"256QAM"},qr=function(n){return n===255?{level:"\u672A\u4F7F\u7528",color:"#999"}:n<=9?{level:"\u5DEE",color:"#ff4d4f"}:n<=16?{level:"\u4E00\u822C",color:"#faad14"}:n<=23?{level:"\u597D",color:"#52c41a"}:{level:"\u4F18\u79C0",color:"#1890ff"}},Ue=function(){var f=j()(d()().mark(function n(){var t,u;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,wn(!0),r.next=4,M.sendCommand("AT^MCS=1");case 4:return t=r.sent,t.success&&t.data&&zn(t.data,"downlink"),r.next=8,new Promise(function(c){return setTimeout(c,50)});case 8:return r.next=10,M.sendCommand("AT^MCS=0");case 10:u=r.sent,u.success&&u.data&&zn(u.data,"uplink"),r.next=17;break;case 14:r.prev=14,r.t0=r.catch(0),console.error("\u83B7\u53D6MCS\u4FE1\u606F\u5931\u8D25:",r.t0);case 17:return r.prev=17,wn(!1),r.finish(17);case 20:case"end":return r.stop()}},n,null,[[0,14,17,20]])}));return function(){return f.apply(this,arguments)}}(),zn=function(n,t){try{var u=n.split(`
`).filter(function(v){return v.includes("^MCS:")}),s=[],r="UNKNOWN";u.forEach(function(v){var p=v.match(/\^MCS:\s*(\d+),(\d+),(.+)/);if(p){var A=p[1],I=p[2],k=p[3].split(",").map(function(S){return parseInt(S.trim())});I==="1"?r="NR":I==="0"&&r==="UNKNOWN"&&(r="LTE");for(var i=0;i<k.length;i+=3)if(i+2<k.length){var y=k[i+1],B=k[i+2],h=qr(y);s.push({index:s.length+1,mcsTableIndex:k[i],code0:y,code1:B,modulation:Kr(y),performance:h.level,color:h.color})}}});var c=s.map(function(v){return v.code0}).filter(function(v){return v!==255}),a=c.length>0?Math.round(c.reduce(function(v,p){return v+p},0)/c.length):0,l={rat:r,carriers:s,avgMCS:a};t==="downlink"?Rr(l):Pr(l)}catch(v){console.error("\u89E3\u6790MCS\u6570\u636E\u5931\u8D25:",v)}},Vr=function(){var f=j()(d()().mark(function n(){var t;return d()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:if(!Ee.current){s.next=3;break}return console.log("\u961F\u5217\u6B63\u5728\u5904\u7406\u4E2D\uFF0C\u8DF3\u8FC7\u672C\u6B21\u8C03\u7528"),s.abrupt("return");case 3:Ee.current=!0,jn(!0);case 5:if(!(Me.current.length>0)){s.next=20;break}if(t=Me.current.shift(),!t){s.next=18;break}return s.prev=8,s.next=11,t();case 11:return s.next=13,new Promise(function(r){return setTimeout(r,50)});case 13:s.next=18;break;case 15:s.prev=15,s.t0=s.catch(8),console.error("\u547D\u4EE4\u6267\u884C\u5931\u8D25:",s.t0);case 18:s.next=5;break;case 20:Ee.current=!1,jn(!1);case 22:case"end":return s.stop()}},n,null,[[8,15]])}));return function(){return f.apply(this,arguments)}}(),Y=function(n){Me.current.push(n),Vr()},Yr=(0,C.useState)(""),Rn=P()(Yr,2),Jr=Rn[0],Xr=Rn[1],ea=(0,C.useState)(0),An=P()(ea,2),$e=An[0],na=An[1],ra=(0,C.useState)(0),Zn=P()(ra,2),Qe=Zn[0],aa=Zn[1],_e=function(){var f=j()(d()().mark(function n(){var t,u,s,r,c;return d()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.prev=0,l.next=3,M.sendCommand("AT^DSAMBR=1");case 3:if(t=l.sent,!(!t.success||!t.data)){l.next=8;break}return l.next=7,M.sendCommand("AT^DSAMBR=8");case 7:t=l.sent;case 8:t.success&&t.data&&(u=t.data.split(","),u.length>=4&&(s=u[3].trim(),Xr(s.substring(1,s.length-1)),r=parseInt(u[1])/1e3,c=parseInt(u[2])/1e3,na(r),aa(c))),l.next=14;break;case 11:l.prev=11,l.t0=l.catch(0),Q.ZP.error("\u83B7\u53D6 AMBR \u4FE1\u606F\u5931\u8D25");case 14:case"end":return l.stop()}},n,null,[[0,11]])}));return function(){return f.apply(this,arguments)}}(),ta=(0,C.useState)("\u672A\u77E5"),Bn=P()(ta,2),Tn=Bn[0],re=Bn[1],Ge=function(){var f=j()(d()().mark(function n(){var t,u,s,r;return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,a.next=3,M.sendCommand("AT+CGEQOSRDP=8");case 3:if(t=a.sent,!(!t.success||!t.data)){a.next=8;break}return a.next=7,M.sendCommand("AT+CGEQOSRDP=1");case 7:t=a.sent;case 8:if(!(t.success&&t.data)){a.next=38;break}if(u=t.data,s=u.match(/\+CGEQOSRDP:\s*\d+,(\d+)/),!(s&&s[1])){a.next=37;break}r=s[1],a.t0=r,a.next=a.t0==="1"?16:a.t0==="2"?18:a.t0==="3"?20:a.t0==="4"?22:a.t0==="5"?24:a.t0==="6"?26:a.t0==="7"?28:a.t0==="8"?30:a.t0==="9"?32:34;break;case 16:return re("\u7B49\u7EA71\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-2,\u9AD8\u4F18\u5148\u7EA7\u8BED\u97F3\u901A\u8BDD"),a.abrupt("break",35);case 18:return re("\u7B49\u7EA72\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF150ms,\u4E22\u5305\u738710^-3,\u6807\u51C6\u8BED\u97F3\u901A\u8BDD"),a.abrupt("break",35);case 20:return re("\u7B49\u7EA73\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF50ms,\u4E22\u5305\u738710^-3,\u5B9E\u65F6\u6E38\u620F"),a.abrupt("break",35);case 22:return re("\u7B49\u7EA74\uFF1AGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u975E\u4F1A\u8BDD\u89C6\u9891"),a.abrupt("break",35);case 24:return re("\u7B49\u7EA75\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-6,IMS\u4FE1\u4EE4"),a.abrupt("break",35);case 26:return re("\u7B49\u7EA76\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u89C6\u9891\u6D41\u5A92\u4F53"),a.abrupt("break",35);case 28:return re("\u7B49\u7EA77\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF100ms,\u4E22\u5305\u738710^-3,\u8BED\u97F3\u3001\u89C6\u9891\u3001\u4E92\u52A8\u6E38\u620F"),a.abrupt("break",35);case 30:return re("\u7B49\u7EA78\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u89C6\u9891\u6D41\u5A92\u4F53\u3001TCP\u5E94\u7528"),a.abrupt("break",35);case 32:return re("\u7B49\u7EA79\uFF1A\u975EGBR\u4E1A\u52A1,\u5EF6\u8FDF300ms,\u4E22\u5305\u738710^-6,\u6807\u51C6\u6570\u636E\u4F20\u8F93"),a.abrupt("break",35);case 34:re("QCI ".concat(r,"\uFF1A\u672A\u77E5\u670D\u52A1\u7B49\u7EA7"));case 35:a.next=38;break;case 37:re("\u672A\u80FD\u83B7\u53D6\u670D\u52A1\u7B49\u7EA7\u4FE1\u606F");case 38:a.next=43;break;case 40:a.prev=40,a.t1=a.catch(0),Q.ZP.error("\u83B7\u53D6\u670D\u52A1\u7B49\u7EA7\u4FE1\u606F\u5931\u8D25");case 43:case"end":return a.stop()}},n,null,[[0,40]])}));return function(){return f.apply(this,arguments)}}(),Nn=function(){var f=j()(d()().mark(function n(){var t,u,s,r,c,a,l,v,p,A,I,k,i,y,B,h,S;return d()().wrap(function(m){for(;;)switch(m.prev=m.next){case 0:return m.prev=0,m.next=3,M.sendCommand("AT^DHCPV6?");case 3:return t=m.sent,t.success&&t.data&&(u=t.data.replace(/^\^DHCPV6:\s*/,""),s=u.split(","),s.length>=8&&Nr({ipv6Address:s[0].trim(),netmask:s[1].trim(),gateway:s[2].trim(),dhcpServer:s[3].trim(),primaryDNS:s[4].trim(),secondaryDNS:s[5].trim(),maxRxData:parseInt(s[6].trim()),maxTxData:parseInt(s[7].trim())})),m.next=7,M.sendCommand("AT^DHCP?");case 7:return r=m.sent,r.success&&r.data&&(c=r.data.replace(/^\^DHCP:\s*/,""),a=c.split(","),a.length>=8&&(l=a[0].trim(),v=a[1].trim(),p=a[2].trim(),A=a[3].trim(),I=a[4].trim(),k=a[5].trim(),i=function(J){for(var H=[],q=0;q<J.length;q+=2)H.push(parseInt(J.substr(q,2),16));return H.reverse().join(".")},Wr({ipv4Address:i(l),subnetMask:i(v),gateway:i(p),dhcpServer:i(A),primaryDNS:i(I),secondaryDNS:i(k),maxRxData:parseInt(a[6].trim()),maxTxData:parseInt(a[7].trim())}))),m.next=11,M.sendCommand("AT^IPV6CAP?");case 11:if(y=m.sent,!(y.success&&y.data)){m.next=30;break}B=y.data.replace(/^\^IPV6CAP:\s*/,""),h=parseInt(B.trim()),S="",m.t0=h,m.next=m.t0===1?19:m.t0===2?21:m.t0===7?23:m.t0===11?25:27;break;case 19:return S="\u4EC5\u652F\u6301IPv4\u534F\u8BAE",m.abrupt("break",29);case 21:return S="\u4EC5\u652F\u6301IPv6\u534F\u8BAE",m.abrupt("break",29);case 23:return S="\u652F\u6301IPv4\u3001IPv6\u548C\u53CC\u6808\u6A21\u5F0F\uFF08\u4F7F\u7528\u76F8\u540CAPN\uFF09",m.abrupt("break",29);case 25:return S="\u652F\u6301IPv4\u3001IPv6\u548C\u53CC\u6808\u6A21\u5F0F\uFF08\u4F7F\u7528\u4E0D\u540CAPN\uFF09",m.abrupt("break",29);case 27:return S="\u672A\u77E5\u80FD\u529B\u503C (0x".concat(h.toString(16).toUpperCase(),")"),m.abrupt("break",29);case 29:Hr({capValue:h,description:S});case 30:m.next=35;break;case 32:m.prev=32,m.t1=m.catch(0),console.error("\u83B7\u53D6DHCP\u4FE1\u606F\u5931\u8D25:",m.t1);case 35:case"end":return m.stop()}},n,null,[[0,32]])}));return function(){return f.apply(this,arguments)}}(),sa=(0,C.useState)({lastDsTime:0,lastTxFlow:0,lastRxFlow:0,totalDsTime:0,totalTxFlow:0,totalRxFlow:0}),Ln=P()(sa,2),xe=Ln[0],ia=Ln[1],la=(0,C.useState)({upSpeed:0,downSpeed:0,lastUpdateTime:0,lastTxFlow:0,lastRxFlow:0}),Wn=P()(la,2),je=Wn[0],On=Wn[1],he=function(n){return parseInt(n,16)},Ie=function(n){return n<1024?"".concat(n," B"):n<1024*1024?"".concat((n/1024).toFixed(2)," KB"):n<1024*1024*1024?"".concat((n/(1024*1024)).toFixed(2)," MB"):"".concat((n/(1024*1024*1024)).toFixed(2)," GB")},Pe=function(n){var t=n*8;return t>=1e9?"".concat((t/1e9).toFixed(2)," Gbps"):t>=1e6?"".concat((t/1e6).toFixed(2)," Mbps"):t>=1e3?"".concat((t/1e3).toFixed(2)," Kbps"):"".concat(Math.round(t)," bps")},Hn=function(n){if(Fe){var t=Math.floor(n/86400),u=Math.floor(n%86400/3600),s=Math.floor(n%3600/60),r=n%60;return"".concat(t,"\u5929").concat(u,"\u65F6").concat(s,"\u5206").concat(r,"\u79D2")}else{var c=Math.floor(n/3600),a=Math.floor(n%3600/60),l=n%60;return"".concat(c,"\u65F6").concat(a,"\u5206").concat(l,"\u79D2")}},ge=function(){var f=j()(d()().mark(function n(){var t,u,s,r,c,a,l,v,p,A,I;return d()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.prev=0,i.next=3,M.sendCommand("AT^DSFLOWQRY");case 3:t=i.sent,t.success&&t.data&&(u=t.data.replace(/^\^DSFLOWQRY:\s*/,""),s=u.split(","),s.length>=6&&(r=Date.now(),c=he(s[4]),a=he(s[5]),je.lastUpdateTime>0?(l=(r-je.lastUpdateTime)/1e3,l>0&&(v=c-je.lastTxFlow,p=a-je.lastRxFlow,A=v/l,I=p/l,On({upSpeed:A,downSpeed:I,lastUpdateTime:r,lastTxFlow:c,lastRxFlow:a}))):On(o()(o()({},je),{},{lastUpdateTime:r,lastTxFlow:c,lastRxFlow:a})),ia({lastDsTime:he(s[0]),lastTxFlow:he(s[1]),lastRxFlow:he(s[2]),totalDsTime:he(s[3]),totalTxFlow:c,totalRxFlow:a}))),i.next=10;break;case 7:i.prev=7,i.t0=i.catch(0),Q.ZP.error("\u83B7\u53D6\u6D41\u91CF\u7EDF\u8BA1\u4FE1\u606F\u5931\u8D25");case 10:case"end":return i.stop()}},n,null,[[0,7]])}));return function(){return f.apply(this,arguments)}}(),oa=function(){var f=j()(d()().mark(function n(){var t;return d()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return s.prev=0,s.next=3,M.sendCommand("AT^DSFLOWCLR");case 3:t=s.sent,t.success?(Q.ZP.success("\u6D41\u91CF\u7EDF\u8BA1\u5DF2\u6E05\u96F6"),ge()):Q.ZP.error("\u6D41\u91CF\u7EDF\u8BA1\u6E05\u96F6\u5931\u8D25"),s.next=10;break;case 7:s.prev=7,s.t0=s.catch(0),Q.ZP.error("\u6D41\u91CF\u7EDF\u8BA1\u6E05\u96F6\u5931\u8D25");case 10:case"end":return s.stop()}},n,null,[[0,7]])}));return function(){return f.apply(this,arguments)}}(),ua=function(){var f=j()(d()().mark(function n(){return d()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:return u.abrupt("return",new Promise(function(){var s=j()(d()().mark(function r(c){var a,l,v,p,A,I,k,i,y,B,h,S,w,m,O,J,H,q,E,D,F;return d()().wrap(function(g){for(;;)switch(g.prev=g.next){case 0:return g.prev=0,g.next=3,M.sendCommand("AT^HCSQ?");case 3:return a=g.sent,a.success&&a.data&&(l=a.data.split(`
`),v=null,p=null,l.forEach(function(X){var te=X.replace(/^\^HCSQ:\s*/,""),oe=te.split(","),ke=oe[0].replace(/"/g,"");ke==="LTE"?v=oe:ke==="NR"&&(p=oe)}),p?(A=parseInt(p[1]),!isNaN(A)&&A!==255&&(I=A===0?-140:A>=97?-44:-140+A,k=ie(I),i=p.length>2?parseInt(p[2]):255,y=0,i!==255&&!isNaN(i)&&(y=i===0?-20:i>=251?30:-20+i*.2,y=Math.min(30,Math.max(-20,y))),se(function(X){return o()(o()({},X),{},{rscp:I,signalPercent:k,sinr:Math.round(y),sysMode:"NR"})}))):v&&(B=parseInt(v[1]),!isNaN(B)&&B!==255&&(h=B===0?-140:B>=97?-44:-140+B,S=ie(h),w=v.length>3?parseInt(v[3]):255,m=0,w!==255&&!isNaN(w)&&(m=w===0?-20:w>=251?30:-20+w*.2,m=Math.min(30,Math.max(-20,m))),O=v.length>4?parseInt(v[4]):255,J=O!==255&&!isNaN(O)?O===0?-19.5:O>=34?-3:-19.5+O*.5:0,se(function(X){return o()(o()({},X),{},{rscp:h,signalPercent:S,sinr:Math.round(m),ecio:Math.round(J),sysMode:"LTE"})})))),g.next=7,M.sendCommand("AT^EONS=2");case 7:if(H=g.sent,!(H.success&&H.data)){g.next=22;break}E=(q=H.data.split(",")[1])===null||q===void 0?void 0:q.trim(),g.t0=E,g.next=g.t0==="46000"||g.t0==="46002"||g.t0==="46004"||g.t0==="46007"||g.t0==="46008"||g.t0==="46020"?13:g.t0==="46001"||g.t0==="46006"||g.t0==="46009"?15:g.t0==="46003"||g.t0==="46005"||g.t0==="46011"?17:g.t0==="46015"?19:21;break;case 13:return ae("\u4E2D\u56FD\u79FB\u52A8"),g.abrupt("break",22);case 15:return ae("\u4E2D\u56FD\u8054\u901A"),g.abrupt("break",22);case 17:return ae("\u4E2D\u56FD\u7535\u4FE1"),g.abrupt("break",22);case 19:return ae("\u4E2D\u56FD\u5E7F\u7535"),g.abrupt("break",22);case 21:ae("\u672A\u77E5\u8FD0\u8425\u5546");case 22:return g.next=24,_e();case 24:return g.next=26,Ge();case 26:return g.next=28,Nn();case 28:return g.next=30,ge();case 30:return g.next=32,M.sendCommand("AT^CHIPTEMP?");case 32:D=g.sent,D.success&&D.data&&(F=D.data.split(":")[1].trim().split(","),Pn({sub3GPA:parseFloat((parseInt(F[0])/10).toFixed(1)),sub6GPA:parseFloat((parseInt(F[1])/10).toFixed(1)),mimoPa:parseFloat((parseInt(F[2])/10).toFixed(1)),tcxo:parseFloat((parseInt(F[3])/10).toFixed(1)),peri1:parseFloat((parseInt(F[4])/10).toFixed(1)),peri2:parseFloat((parseInt(F[5])/10).toFixed(1)),ap1:parseFloat((parseInt(F[6])/10).toFixed(1)),ap2:parseFloat((parseInt(F[7])/10).toFixed(1)),modem1:parseFloat((parseInt(F[8])/10).toFixed(1)),modem2:parseFloat((parseInt(F[9])/10).toFixed(1)),bbp1:parseFloat((parseInt(F[10])/10).toFixed(1)),bbp2:parseFloat((parseInt(F[11])/10).toFixed(1))})),c(),g.next=41;break;case 37:g.prev=37,g.t1=g.catch(0),console.error("\u83B7\u53D6\u7F51\u7EDC\u72B6\u6001\u5931\u8D25:",g.t1),c();case 41:case"end":return g.stop()}},r,null,[[0,37]])}));return function(r){return s.apply(this,arguments)}}()));case 1:case"end":return u.stop()}},n)}));return function(){return f.apply(this,arguments)}}(),Un=function(){var f=j()(d()().mark(function n(){var t,u;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,r.next=3,M.getPSRegStatus();case 3:if(t=r.sent,!(t.success&&t.data)){r.next=23;break}u=JSON.parse(t.data),fr(u),r.t0=u.stat,r.next=r.t0===0?10:r.t0===1?12:r.t0===2?14:r.t0===3?16:r.t0===4?18:r.t0===5?20:22;break;case 10:return ue("\u672A\u641C\u7D22\u7F51\u7EDC"),r.abrupt("break",23);case 12:return ue("\u5DF2\u6CE8\u518C\uFF0C\u672C\u5730\u7F51\u7EDC"),r.abrupt("break",23);case 14:return ue("\u6B63\u5728\u641C\u7D22\u7F51\u7EDC..."),r.abrupt("break",23);case 16:return ue("\u6CE8\u518C\u88AB\u62D2\u7EDD"),r.abrupt("break",23);case 18:return ue("\u672A\u77E5\u72B6\u6001"),r.abrupt("break",23);case 20:return ue("\u5DF2\u6CE8\u518C\uFF0C\u6F2B\u6E38\u7F51\u7EDC"),r.abrupt("break",23);case 22:ue("\u672A\u77E5\u72B6\u6001");case 23:r.next=27;break;case 25:r.prev=25,r.t1=r.catch(0);case 27:case"end":return r.stop()}},n,null,[[0,25]])}));return function(){return f.apply(this,arguments)}}(),ya=function(){var f=j()(d()().mark(function n(){var t,u,s,r,c,a,l,v,p,A,I,k,i,y,B,h,S,w,m,O,J,H,q,E,D,F,$,g,X,te,oe,ke,_n,ee,ve,ze,Re,be,Ae,Ze;return d()().wrap(function(Z){for(;;)switch(Z.prev=Z.next){case 0:return Z.prev=0,Z.next=3,M.sendCommand("AT^HCSQ?");case 3:return t=Z.sent,t.success&&t.data&&(u=t.data.split(`
`),s=null,r=null,u.forEach(function(T){var De=T.replace(/^\^HCSQ:\s*/,""),Ke=De.split(","),Gn=Ke[0].replace(/"/g,"");Gn==="LTE"?s=Ke:Gn==="NR"&&(r=Ke)}),r?(c=parseInt(r[1]),!isNaN(c)&&c!==255&&(a=c===0?-140:c>=97?-44:-140+c,l=r.length>2?parseInt(r[2]):255,v=0,l!==255&&!isNaN(l)&&(v=l===0?-20:l>=251?30:-20+l*.2,v=Math.min(30,Math.max(-20,v))),p=r.length>3?parseInt(r[3]):255,A=p!==255&&!isNaN(p)?p===0?-19.5:p>=34?-3:-19.5+p*.5:0,se(function(T){return o()(o()({},T),{},{rscp:a,signalPercent:ie(a),sinr:Math.round(v),sysMode:"NR",networkMode:s?"EN-DC (LTE+NR)":"NR"})}))):s&&(I=parseInt(s[1]),!isNaN(I)&&I!==255&&(k=I===0?-140:I>=97?-44:-140+I,i=ie(k),y=s.length>3?parseInt(s[3]):255,B=0,y!==255&&!isNaN(y)&&(B=y===0?-20:y>=251?30:-20+y*.2,B=Math.min(30,Math.max(-20,B))),h=s.length>4?parseInt(s[4]):255,S=h!==255&&!isNaN(h)?h===0?-19.5:h>=34?-3:-19.5+h*.5:0,se(function(T){return o()(o()({},T),{},{rscp:k,signalPercent:i,sinr:Math.round(B),ecio:Math.round(S),sysMode:"LTE",networkMode:"LTE"})})))),Z.next=7,M.sendCommand("AT^MONSC");case 7:if(w=Z.sent,!(w.success&&w.data)){Z.next=54;break}return m=w.data,m.includes("^MONSC:")?(J=m.replace(/^\^MONSC:\s*/,""),O=J.split(",")):O=m.split(","),H=parseInt(O[8],10),q=ie(H),Z.next=15,M.sendCommand("AT^HFREQINFO?");case 15:if(E=Z.sent,D=[],F="",!(E.success&&E.data)){Z.next=54;break}if($=E.data.replace(/^\^HFREQINFO:\s*/,"").split(","),D=[],!($.length>=9)){Z.next=54;break}for(F=$[1],g=2;g+6<=$.length&&D.length<3;)X=parseInt($[g]),te=F==="7"?"n".concat(X):"B".concat(X),oe=F==="7"?Fn[X.toString()]||"\u672A\u77E5\u9891\u6BB5":Mn[X.toString()]||"\u672A\u77E5\u9891\u6BB5",D.push({band:X.toString(),bandShortName:te,bandDesc:oe,dlFcn:$[g+1].trim(),dlFreq:(parseInt($[g+2])*(F==="7"?.001:.1)).toFixed(2),dlBandwidth:parseInt($[g+3])/1e3,ulFcn:$[g+4].trim(),ulFreq:(parseInt($[g+5])*(F==="7"?.001:.1)).toFixed(2),ulBandwidth:parseInt($[g+6])/1e3,sysMode:F==="7"?"NR":"LTE"}),g+=7;if(ke=parseFloat(D.reduce(function(T,De){return T+De.dlBandwidth},0).toFixed(2)),_n=parseFloat(D.reduce(function(T,De){return T+De.ulBandwidth},0).toFixed(2)),ee="",!(D.length>0)){Z.next=48;break}if(!(D.some(function(T){return T.sysMode==="NR"})&&D.some(function(T){return T.sysMode==="LTE"}))){Z.next=33;break}ee="EN-DC (LTE+NR)",Z.next=46;break;case 33:if(!D.some(function(T){return T.sysMode==="NR"})){Z.next=37;break}ee=D.length>1?"NR-CA":"NR",Z.next=46;break;case 37:if(!D.some(function(T){return T.sysMode==="LTE"})){Z.next=41;break}ee=D.length>1?"LTE-CA":"LTE",Z.next=46;break;case 41:return Z.next=43,M.sendCommand("AT^HCSQ?");case 43:ze=Z.sent,Re=ze==null||(ve=ze.data)===null||ve===void 0||(ve=ve.split(",")[0])===null||ve===void 0?void 0:ve.replace(/"/g,""),Re==="NR"?ee="NR":Re==="LTE"?ee="LTE":Re==="WCDMA"?ee="WCDMA":ee="\u672A\u77E5";case 46:Z.next=53;break;case 48:return Z.next=50,M.sendCommand("AT^HCSQ?");case 50:Ae=Z.sent,Ze=Ae==null||(be=Ae.data)===null||be===void 0||(be=be.split(",")[0])===null||be===void 0?void 0:be.replace(/"/g,""),Ze==="NR"?ee="NR":Ze==="LTE"?ee="LTE":Ze==="WCDMA"?ee="WCDMA":ee="\u672A\u77E5";case 53:se(function(T){return o()(o()({},T),{},{carrierInfo:D,carrierCount:D.length,dlBandwidth:ke,ulBandwidth:_n,networkMode:ee,mcc:T.mcc,mnc:T.mnc,lac:T.lac,cid:T.cid,channel:T.channel,pci:T.pci,rscp:T.rscp,signalPercent:T.signalPercent,ecio:T.ecio,sinr:T.sinr})});case 54:Z.next=59;break;case 56:Z.prev=56,Z.t0=Z.catch(0),console.error("\u5237\u65B0\u7F51\u7EDC\u4FE1\u606F\u5931\u8D25:",Z.t0);case 59:case"end":return Z.stop()}},n,null,[[0,56]])}));return function(){return f.apply(this,arguments)}}(),$n=function(){var f=j()(d()().mark(function n(){var t,u;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,r.next=3,M.sendCommand("AT^CHIPTEMP?");case 3:t=r.sent,t.success&&t.data&&(u=t.data.split(":")[1].trim().split(","),Pn({sub3GPA:parseFloat((parseInt(u[0])/10).toFixed(1)),sub6GPA:parseFloat((parseInt(u[1])/10).toFixed(1)),mimoPa:parseFloat((parseInt(u[2])/10).toFixed(1)),tcxo:parseFloat((parseInt(u[3])/10).toFixed(1)),peri1:parseFloat((parseInt(u[4])/10).toFixed(1)),peri2:parseFloat((parseInt(u[5])/10).toFixed(1)),ap1:parseFloat((parseInt(u[6])/10).toFixed(1)),ap2:parseFloat((parseInt(u[7])/10).toFixed(1)),modem1:parseFloat((parseInt(u[8])/10).toFixed(1)),modem2:parseFloat((parseInt(u[9])/10).toFixed(1)),bbp1:parseFloat((parseInt(u[10])/10).toFixed(1)),bbp2:parseFloat((parseInt(u[11])/10).toFixed(1))})),r.next=11;break;case 7:throw r.prev=7,r.t0=r.catch(0),console.error("\u5237\u65B0\u6E29\u5EA6\u6570\u636E\u5931\u8D25:",r.t0),r.t0;case 11:case"end":return r.stop()}},n,null,[[0,7]])}));return function(){return f.apply(this,arguments)}}(),Qn=function(){var f=j()(d()().mark(function n(){var t;return d()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:Je(!0),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,Un();case 2:case"end":return a.stop()}},r)}))),Y(j()(d()().mark(function r(){var c,a,l,v,p,A,I,k,i,y,B,h,S,w,m,O;return d()().wrap(function(H){for(;;)switch(H.prev=H.next){case 0:return H.next=2,M.sendCommand("AT^HCSQ?");case 2:c=H.sent,c.success&&c.data&&(a=c.data.split(`
`),l=null,v=null,a.forEach(function(q){var E=q.replace(/^\^HCSQ:\s*/,""),D=E.split(","),F=D[0].replace(/"/g,"");F==="LTE"?l=D:F==="NR"&&(v=D)}),v?(p=parseInt(v[1]),!isNaN(p)&&p!==255&&(A=p===0?-140:p>=97?-44:-140+p,I=ie(A),k=v.length>2?parseInt(v[2]):255,i=0,k!==255&&!isNaN(k)&&(i=k===0?-20:k>=251?30:-20+k*.2,i=Math.min(30,Math.max(-20,i))),se(function(q){return o()(o()({},q),{},{rscp:A,signalPercent:I,sinr:Math.round(i),sysMode:"NR"})}))):l&&(y=parseInt(l[1]),!isNaN(y)&&y!==255&&(B=y===0?-140:y>=97?-44:-140+y,h=ie(B),S=l.length>3?parseInt(l[3]):255,w=0,S!==255&&!isNaN(S)&&(w=S===0?-20:S>=251?30:-20+S*.2,w=Math.min(30,Math.max(-20,w))),m=l.length>4?parseInt(l[4]):255,O=m!==255&&!isNaN(m)?m===0?-19.5:m>=34?-3:-19.5+m*.5:0,se(function(q){return o()(o()({},q),{},{rscp:B,signalPercent:h,sinr:Math.round(w),ecio:Math.round(O),sysMode:"LTE"})}))));case 4:case"end":return H.stop()}},r)}))),Y(j()(d()().mark(function r(){var c,a,l;return d()().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,M.sendCommand("AT^EONS=2");case 2:if(c=p.sent,!(c.success&&c.data)){p.next=17;break}l=(a=c.data.split(",")[1])===null||a===void 0?void 0:a.trim(),p.t0=l,p.next=p.t0==="46000"||p.t0==="46002"||p.t0==="46004"||p.t0==="46007"||p.t0==="46008"||p.t0==="46020"?8:p.t0==="46001"||p.t0==="46006"||p.t0==="46009"?10:p.t0==="46003"||p.t0==="46005"||p.t0==="46011"?12:p.t0==="46015"?14:16;break;case 8:return ae("\u4E2D\u56FD\u79FB\u52A8"),p.abrupt("break",17);case 10:return ae("\u4E2D\u56FD\u8054\u901A"),p.abrupt("break",17);case 12:return ae("\u4E2D\u56FD\u7535\u4FE1"),p.abrupt("break",17);case 14:return ae("\u4E2D\u56FD\u5E7F\u7535"),p.abrupt("break",17);case 16:ae("\u672A\u77E5\u8FD0\u8425\u5546");case 17:case"end":return p.stop()}},r)}))),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,ye();case 2:case"end":return a.stop()}},r)}))),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,_e();case 2:case"end":return a.stop()}},r)}))),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,Ge();case 2:case"end":return a.stop()}},r)}))),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,Nn();case 2:case"end":return a.stop()}},r)}))),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,ge();case 2:case"end":return a.stop()}},r)}))),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,$n();case 2:case"end":return a.stop()}},r)}))),Y(j()(d()().mark(function r(){return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,Ue();case 2:case"end":return a.stop()}},r)}))),t=setInterval(function(){!Ee.current&&Me.current.length===0&&(Je(!1),clearInterval(t))},200);case 12:case"end":return s.stop()}},n)}));return function(){return f.apply(this,arguments)}}();(0,C.useEffect)(function(){var f=function(){var t=j()(d()().mark(function u(){var s;return d()().wrap(function(c){for(;;)switch(c.prev=c.next){case 0:return c.prev=0,c.next=3,M.connect();case 3:if(s=c.sent,!s){c.next=7;break}return c.next=7,Qn();case 7:c.next=12;break;case 9:c.prev=9,c.t0=c.catch(0),c.t0.message==="REQUIRE_AUTH_KEY"?console.log("Network/Info: \u7B49\u5F85\u5BC6\u94A5\u8BA4\u8BC1..."):console.error("Network/Info: \u8FDE\u63A5\u5931\u8D25:",c.t0);case 12:case"end":return c.stop()}},u,null,[[0,9]])}));return function(){return t.apply(this,arguments)}}(),n=M.onConnectSuccess(function(){console.log("Network/Info: \u8FDE\u63A5\u6210\u529F\uFF0C\u5F00\u59CB\u52A0\u8F7D\u6570\u636E"),Qn()});return f(),function(){Object.values(z).forEach(function(t){t&&clearInterval(t)}),n(),M.disconnect()}},[]);var ja=function(n){return n>=31?4:n>=21?3:n>=11?2:n>=1?1:0};(0,C.useEffect)(function(){var f=Be.S.getInstance(),n=function(u){};return f.subscribe(n),function(){f.unsubscribe(n)}},[]),(0,C.useEffect)(function(){var f=Be.S.getInstance(),n=null,t=function(){var r=j()(d()().mark(function c(a){var l,v;return d()().wrap(function(A){for(;;)switch(A.prev=A.next){case 0:if(!R.networkInfo.enabled){A.next=2;break}return A.abrupt("return");case 2:a.type==="signal_data"&&a.success&&(l=a.data,v={},l.rsrp!==void 0&&(v.rscp=l.rsrp,v.signalPercent=ie(l.rsrp)),l.sinr!==void 0&&(v.sinr=l.sinr),l.rsrq!==void 0&&(v.ecio=l.rsrq),l.rssi!==void 0&&(v.rscp=l.rssi),Object.keys(v).length>0&&se(function(I){return o()(o()({},I),v)}),n&&clearInterval(n),Ce(!0),Cr(0),setTimeout(j()(d()().mark(function I(){return d()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,ye();case 2:case"end":return i.stop()}},I)})),5e3));case 3:case"end":return A.stop()}},c)}));return function(a){return r.apply(this,arguments)}}(),u=function(){var r=j()(d()().mark(function c(){return d()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.prev=0,l.next=3,ye();case 3:return l.next=5,ua();case 5:l.next=10;break;case 7:l.prev=7,l.t0=l.catch(0),console.error("\u6570\u636E\u5237\u65B0\u5931\u8D25:",l.t0);case 10:case"end":return l.stop()}},c,null,[[0,7]])}));return function(){return r.apply(this,arguments)}}(),s=function(){var r=j()(d()().mark(function c(){return d()().wrap(function(l){for(;;)switch(l.prev=l.next){case 0:return l.prev=0,l.next=3,u();case 3:return l.next=5,_e();case 5:return l.next=7,Ge();case 7:return l.next=9,Un();case 9:return l.next=11,ge();case 11:l.next=16;break;case 13:l.prev=13,l.t0=l.catch(0),console.error("\u6570\u636E\u5237\u65B0\u5931\u8D25:",l.t0);case 16:case"end":return l.stop()}},c,null,[[0,13]])}));return function(){return r.apply(this,arguments)}}();return f.subscribe(t),function(){f.unsubscribe(t),n&&clearInterval(n),hn&&clearInterval(hn),z.networkSpeed&&clearInterval(z.networkSpeed),z.flowStats&&clearInterval(z.flowStats),z.networkInfo&&clearInterval(z.networkInfo),z.tempMonitor&&clearInterval(z.tempMonitor)}},[]);var ie=function(n){return n>=-80?"100%":n>=-90?"90%":n>=-100?"80%":n>=-110?"50%":"25%"};return(0,e.jsxs)("div",{children:[Br,(0,e.jsxs)(U.Z,{gutter:[16,16],children:[(0,e.jsx)(x.Z,{xs:24,md:24,children:(0,e.jsx)(L.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u7F51\u7EDC\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u5F53\u524D\u7F51\u7EDC\u7684\u5404\u9879\u5173\u952E\u6307\u6807"})]}),extra:(0,e.jsxs)(pe.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:R.networkInfo.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||le("networkInfo",!R.networkInfo.enabled,R.networkInfo.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),R.networkInfo.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:R.networkInfo.interval,onChange:function(n){return le("networkInfo",!0,n||5)},style:{width:45},size:"small",bordered:!1}),R.networkInfo.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),className:"inner-card",children:(0,e.jsxs)(U.Z,{gutter:[16,16],children:[(0,e.jsx)(x.Z,{xs:24,lg:16,children:(0,e.jsx)(L.Z,{size:"small",title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:["\u4FE1\u53F7\u770B\u677F",b.networkMode&&(0,e.jsx)("span",{style:{fontSize:"13px",backgroundColor:b.networkMode.includes("NR")?"#52c41a":b.networkMode.includes("LTE")?"#1890ff":b.networkMode.includes("WCDMA")?"#faad14":b.networkMode.includes("GSM")?"#ff4d4f":"#999",color:"#fff",padding:"1px 6px",borderRadius:"10px",marginLeft:"8px"},children:b.networkMode}),(0,e.jsx)(er.Z,{color:Te.includes("\u672C\u5730")?"success":Te.includes("\u6F2B\u6E38")?"warning":"error",children:Te})]}),bordered:!0,style:{background:"var(--ant-bg-elevated)",height:"100%",border:"1px solid var(--ant-border-color-split)",boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)"},children:(0,e.jsxs)(U.Z,{gutter:[16,16],children:[(0,e.jsx)(x.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)(Jn.Z,{style:{fontSize:"32px",color:b.signalPercent==="100%"||b.signalPercent==="90%"?"#52c41a":b.signalPercent==="80%"?"#faad14":(b.signalPercent==="50%","#ff4d4f")}}),(0,e.jsx)("div",{style:{marginTop:"8px",fontWeight:"bold",color:b.signalPercent==="100%"||b.signalPercent==="90%"?"#52c41a":b.signalPercent==="80%"?"#faad14":(b.signalPercent==="50%","#ff4d4f")},children:b.signalPercent||"\u672A\u77E5"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:"\u4FE1\u53F7\u8D28\u91CF"})]})}),(0,e.jsx)(x.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.rscp>=-85?"#52c41a":b.rscp>=-95?"#faad14":"#ff4d4f"},children:b.rscp}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"RSRP (dBm)":b.networkMode.includes("WCDMA")?"RSCP (dBm)":"RSSI (dBm)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u53C2\u8003\u4FE1\u53F7\u63A5\u6536\u529F\u7387":b.networkMode.includes("WCDMA")?"\u63A5\u6536\u4FE1\u53F7\u7801\u529F\u7387":"\u63A5\u6536\u4FE1\u53F7\u5F3A\u5EA6\u6307\u793A"})]})}),(0,e.jsx)(x.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.sinr>=20?"#52c41a":b.sinr>=10?"#faad14":"#ff4d4f"},children:b.sinr}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"SINR (dB)":b.networkMode.includes("WCDMA")?"Ec/Io (dB)":"SINR (dB)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u4FE1\u566A\u6BD4":b.networkMode.includes("WCDMA")?"\u5BFC\u9891\u4FE1\u53F7\u80FD\u91CF/\u5E72\u6270\u6BD4":"\u4FE1\u566A\u6BD4"})]})}),(0,e.jsx)(x.Z,{xs:6,sm:6,children:(0,e.jsxs)("div",{style:{textAlign:"center"},children:[(0,e.jsx)("div",{style:{fontSize:"24px",fontWeight:"bold",color:b.ecio>=-10?"#52c41a":b.ecio>=-15?"#faad14":"#ff4d4f"},children:b.ecio}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"RSRQ (dB)":b.networkMode.includes("WCDMA")?"ECIO (dB)":"RSSI (dBm)"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"var(--ant-text-color-secondary)"},children:b.networkMode.includes("NR")||b.networkMode.includes("LTE")?"\u53C2\u8003\u4FE1\u53F7\u63A5\u6536\u8D28\u91CF":b.networkMode.includes("WCDMA")?"\u5BFC\u9891\u4FE1\u9053\u63A5\u6536\u8D28\u91CF":"\u63A5\u6536\u4FE1\u53F7\u5F3A\u5EA6\u6307\u793A"})]})})]})})}),(0,e.jsx)(x.Z,{xs:24,lg:8,children:(0,e.jsx)(L.Z,{size:"small",title:"\u7F51\u7EDC\u53C2\u6570",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)(U.Z,{gutter:[16,8],children:[(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"PCI:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.pci})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u9891\u70B9:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.channel})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"MCC-MNC:"}),(0,e.jsxs)("div",{style:{fontWeight:"bold"},children:[b.mcc,"-",b.mnc]})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"LAC:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.lac})]}),(0,e.jsxs)(x.Z,{span:24,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u5C0F\u533AID:"}),(0,e.jsx)("div",{style:{fontWeight:"bold"},children:b.cid})]})]})})}),(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsx)(L.Z,{type:"inner",title:(0,e.jsxs)("span",{children:["\u8F7D\u6CE2\u805A\u5408\u4FE1\u606F",b.carrierCount>0?(0,e.jsxs)("span",{style:{marginLeft:"8px",fontSize:"14px",color:"#1890ff"},children:["(",b.carrierCount,"\u8F7D\u6CE2 | \u603B\u5E26\u5BBD: \u4E0B\u884C",b.dlBandwidth,"MHz/\u4E0A\u884C",b.ulBandwidth,"MHz)"]}):(0,e.jsx)("span",{style:{marginLeft:"8px",fontSize:"14px",color:"var(--ant-text-color-secondary)"},children:"\u65E0\u8F7D\u6CE2"})]}),extra:(0,e.jsxs)(pe.ZP,{size:"small",type:"default",disabled:R.networkInfo.enabled,style:{background:R.carrierMCS.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px",color:R.networkInfo.enabled?"#d9d9d9":"#1890ff",cursor:R.networkInfo.enabled?"not-allowed":"pointer"},onClick:function(n){if(!n.target.closest(".ant-input-number")){if(R.networkInfo.enabled){Q.ZP.warning('\u8BF7\u5148\u5173\u95ED\u4E0A\u65B9"\u7F51\u7EDC\u4FE1\u606F"\u7684\u81EA\u52A8\u5237\u65B0');return}le("carrierMCS",!R.carrierMCS.enabled,R.carrierMCS.interval)}},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),R.carrierMCS.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:R.carrierMCS.interval,onChange:function(n){return le("carrierMCS",!0,n||5)},style:{width:45},size:"small",bordered:!1}),R.carrierMCS.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),style:{background:"var(--ant-bg-elevated)",border:"1px solid var(--ant-border-color-split)",boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)"},children:b.carrierInfo.length>0?(0,e.jsx)("div",{children:(0,e.jsx)(U.Z,{gutter:[16,16],children:b.carrierInfo.map(function(f,n){return(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,children:(0,e.jsxs)(L.Z,{size:"small",title:(0,e.jsxs)("span",{style:{color:n===0?"#1890ff":"#666",fontWeight:n===0?"bold":"normal"},children:[n===0?"\u4E3B\u8F7D\u6CE2":"\u8F85\u8F7D\u6CE2 ".concat(n),(0,e.jsxs)("span",{style:{marginLeft:"8px",fontSize:"12px",color:f.sysMode==="NR"?"#52c41a":"#fa8c16"},children:["(",f.sysMode,")"]})]}),style:{borderLeft:n===0?"3px solid #1890ff":f.sysMode==="NR"?"3px solid #52c41a":"3px solid #fa8c16",height:"100%",boxShadow:"0 2px 8px rgba(0,0,0,0.09)"},children:[(0,e.jsxs)("div",{style:{marginBottom:"8px"},children:[(0,e.jsx)("span",{style:{fontWeight:"bold"},children:f.bandShortName}),(0,e.jsxs)("span",{style:{color:"#666",fontSize:"12px",marginLeft:"8px"},children:["(",f.bandDesc,")"]})]}),(0,e.jsxs)(U.Z,{gutter:[8,8],children:[(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u9891\u70B9:"}),(0,e.jsx)("div",{children:f.dlFcn})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u9891\u70B9:"}),(0,e.jsx)("div",{children:f.ulFcn})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u9891\u7387:"}),(0,e.jsxs)("div",{children:[f.dlFreq," MHz"]})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u9891\u7387:"}),(0,e.jsxs)("div",{children:[f.ulFreq," MHz"]})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884C\u5E26\u5BBD:"}),(0,e.jsxs)("div",{children:[f.dlBandwidth," MHz"]})]}),(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884C\u5E26\u5BBD:"}),(0,e.jsxs)("div",{children:[f.ulBandwidth," MHz"]})]}),(ce==null?void 0:ce.carriers[n])&&(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0B\u884CMCS:"}),(0,e.jsxs)("div",{style:{display:"flex",alignItems:"baseline",gap:"4px"},children:[(0,e.jsx)("span",{style:{fontSize:"16px",fontWeight:"bold",color:ce.carriers[n].color},children:ce.carriers[n].code0===255?"-":ce.carriers[n].code0}),(0,e.jsx)("span",{style:{fontSize:"11px",color:"#999"},children:ce.carriers[n].modulation})]})]})}),(de==null?void 0:de.carriers[n])&&(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)(x.Z,{span:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666"},children:"\u4E0A\u884CMCS:"}),(0,e.jsxs)("div",{style:{display:"flex",alignItems:"baseline",gap:"4px"},children:[(0,e.jsx)("span",{style:{fontSize:"16px",fontWeight:"bold",color:de.carriers[n].color},children:de.carriers[n].code0===255?"-":de.carriers[n].code0}),(0,e.jsx)("span",{style:{fontSize:"11px",color:"#999"},children:de.carriers[n].modulation})]})]})})]})]})},n)})})}):(0,e.jsx)("div",{style:{color:"#666",fontSize:"14px",padding:"16px 0",textAlign:"center"},children:"\u5F53\u524D\u672A\u83B7\u53D6\u5230\u8F7D\u6CE2\u4FE1\u606F\u6216\u672A\u542F\u7528\u8F7D\u6CE2\u805A\u5408"})})})]})})}),(0,e.jsx)(x.Z,{xs:24,md:12,children:(0,e.jsx)(L.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u7F51\u7EDC\u901F\u7387\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u7F51\u7EDC\u901F\u7387\u76F8\u5173\u4FE1\u606F"})]}),extra:(0,e.jsx)(nr.Z,{checkedChildren:"\u5B9E\u65F6\u7F51\u901F\u5F00\u542F",unCheckedChildren:"\u5B9E\u65F6\u7F51\u901F\u5173\u95ED",checked:we,onChange:Ur}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)(U.Z,{gutter:[24,24],children:[(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsxs)(L.Z,{size:"small",title:"\u5B9E\u65F6\u7F51\u901F",bordered:!1,style:{background:"#f9f9f9",position:"relative"},children:[we?null:(0,e.jsx)("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(255, 255, 255, 0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1},children:(0,e.jsx)("div",{style:{color:"#999",fontSize:"14px"},children:"\u6682\u672A\u5F00\u542F\u5B9E\u65F6\u7F51\u901F\u76D1\u63A7"})}),(0,e.jsxs)(U.Z,{gutter:[16,16],children:[(0,e.jsx)(x.Z,{xs:12,children:(0,e.jsx)(V.Z,{title:"\u4E0A\u884C\u901F\u7387",value:_&&_.ulPdcpRate>0?Pe(_.ulPdcpRate):K?Pe(K.ulPdcpRate):"0 bps",valueStyle:{color:((_==null?void 0:_.ulPdcpRate)||(K==null?void 0:K.ulPdcpRate)||0)*8>=1e8?"#52c41a":((_==null?void 0:_.ulPdcpRate)||(K==null?void 0:K.ulPdcpRate)||0)*8>=1e7?"#1890ff":"#faad14",fontSize:"18px"}})}),(0,e.jsx)(x.Z,{xs:12,children:(0,e.jsx)(V.Z,{title:"\u4E0B\u884C\u901F\u7387",value:_&&_.dlPdcpRate>0?Pe(_.dlPdcpRate):K?Pe(K.dlPdcpRate):"0 bps",valueStyle:{color:((_==null?void 0:_.dlPdcpRate)||(K==null?void 0:K.dlPdcpRate)||0)*8>=1e8?"#52c41a":((_==null?void 0:_.dlPdcpRate)||(K==null?void 0:K.dlPdcpRate)||0)*8>=1e7?"#1890ff":"#faad14",fontSize:"18px"}})})]})]})}),(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsx)(L.Z,{size:"small",title:"\u5F53\u524D\u7F51\u7EDC",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)(U.Z,{gutter:[16,16],children:[(0,e.jsx)(x.Z,{xs:24,sm:12,children:(0,e.jsxs)(U.Z,{gutter:[8,8],children:[(0,e.jsx)(x.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u4E0A\u884C\u901F\u7387"}),(0,e.jsxs)("div",{style:{fontSize:"16px",fontWeight:500,color:Qe>=50?"#52c41a":Qe>=25?"#faad14":"#ff4d4f"},children:[Qe," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"Mbps"})]})]})}),(0,e.jsx)(x.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u4E0B\u884C\u901F\u7387"}),(0,e.jsxs)("div",{style:{fontSize:"16px",fontWeight:500,color:$e>=100?"#52c41a":$e>=50?"#faad14":"#ff4d4f"},children:[$e," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"Mbps"})]})]})})]})}),(0,e.jsx)(x.Z,{xs:24,sm:12,children:(0,e.jsxs)(U.Z,{gutter:[8,8],children:[(0,e.jsx)(x.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u8FD0\u8425\u5546"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:lr})]})}),(0,e.jsx)(x.Z,{span:12,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px",height:"100%"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"APN"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:Jr||"\u672A\u77E5"})]})})]})}),(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsxs)("div",{style:{background:"#fff",padding:"8px 12px",borderRadius:"4px"},children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"QCI (\u670D\u52A1\u8D28\u91CF\u7B49\u7EA7)"}),(0,e.jsxs)("div",{style:{fontSize:"14px",color:"#666"},children:[Tn.split("\uFF1A")[0],(0,e.jsx)("span",{style:{marginLeft:"8px",fontSize:"12px",color:"#999"},children:Tn.split("\uFF1A")[1]})]})]})})]})})})]})})}),(0,e.jsx)(x.Z,{xs:24,md:12,children:(0,e.jsx)(L.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u6D41\u91CF\u7EDF\u8BA1"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793A\u7F51\u7EDC\u8FDE\u63A5\u65F6\u95F4\u548C\u6D41\u91CF\u4FE1\u606F"})]}),extra:(0,e.jsxs)(rr.Z,{children:[(0,e.jsx)(pe.ZP,{type:Fe?"primary":"default",onClick:function(){return Er(!Fe)},size:"small",children:Fe?"\u663E\u793A\u65F6\u5206\u79D2":"\u663E\u793A\u5929\u6570"}),(0,e.jsxs)(pe.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:R.flowStats.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||le("flowStats",!R.flowStats.enabled,R.flowStats.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),R.flowStats.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:R.flowStats.interval,onChange:function(n){return le("flowStats",!0,n||5)},style:{width:45},size:"small",bordered:!1}),R.flowStats.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]})]}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)(U.Z,{gutter:[24,24],children:[(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsx)(L.Z,{size:"small",title:"\u6700\u540E\u4E00\u6B21\u8FDE\u63A5",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)(U.Z,{gutter:[24,16],children:[(0,e.jsx)(x.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u8FDE\u63A5\u65F6\u957F",value:Hn(xe.lastDsTime),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(x.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u4E0A\u4F20\u6D41\u91CF",value:Ie(xe.lastTxFlow),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(x.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u4E0B\u8F7D\u6D41\u91CF",value:Ie(xe.lastRxFlow),valueStyle:{fontSize:"16px"}})})]})})}),(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsx)(L.Z,{size:"small",title:"\u7D2F\u8BA1\u7EDF\u8BA1",bordered:!1,style:{background:"#f9f9f9"},children:(0,e.jsxs)(U.Z,{gutter:[24,16],children:[(0,e.jsx)(x.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u603B\u8FDE\u63A5\u65F6\u957F",value:Hn(xe.totalDsTime),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(x.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u603B\u4E0A\u4F20\u6D41\u91CF",value:Ie(xe.totalTxFlow),valueStyle:{fontSize:"16px"}})}),(0,e.jsx)(x.Z,{xs:24,sm:8,children:(0,e.jsx)(V.Z,{title:"\u603B\u4E0B\u8F7D\u6D41\u91CF",value:Ie(xe.totalRxFlow),valueStyle:{fontSize:"16px"}})})]})})}),(0,e.jsx)(x.Z,{xs:24,style:{marginTop:8,textAlign:"right"},children:(0,e.jsx)(pe.ZP,{danger:!0,onClick:oa,size:"middle",children:"\u6E05\u96F6"})})]})})}),(0,e.jsx)(x.Z,{xs:24,md:12,children:Qr()}),(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsx)(L.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"DHCP\u914D\u7F6E\u4FE1\u606F"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"\u5C55\u793AIPv4/IPv6\u7F51\u7EDC\u914D\u7F6E"})]}),className:"inner-card",style:{height:"100%"},children:(0,e.jsxs)(U.Z,{gutter:[16,16],children:[(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsx)(L.Z,{size:"small",title:"IPv6\u80FD\u529B\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",marginBottom:"16px"},children:(0,e.jsxs)(U.Z,{gutter:[16,8],children:[(0,e.jsxs)(x.Z,{xs:24,sm:8,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u80FD\u529B\u503C"}),(0,e.jsxs)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:["0x",He.capValue?He.capValue.toString(16).toUpperCase().padStart(2,"0"):"00"]})]}),(0,e.jsxs)(x.Z,{xs:24,sm:16,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u80FD\u529B\u63CF\u8FF0"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500},children:He.description||"\u672A\u83B7\u53D6"})]})]})})}),(0,e.jsx)(x.Z,{xs:24,md:12,children:(0,e.jsx)(L.Z,{size:"small",title:"IPv4 \u7F51\u7EDC\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)(U.Z,{gutter:[16,8],children:[(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv4\u5730\u5740"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.ipv4Address||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5B50\u7F51\u63A9\u7801"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.subnetMask||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u7F51\u5173"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.gateway||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"DHCP\u670D\u52A1\u5668"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.dhcpServer||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u9996\u9009DNS"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.primaryDNS||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5907\u7528DNS"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:me.secondaryDNS||"\u672A\u83B7\u53D6"})]})]})})}),(0,e.jsx)(x.Z,{xs:24,md:12,children:(0,e.jsx)(L.Z,{size:"small",title:"IPv6 \u7F51\u7EDC\u914D\u7F6E",bordered:!1,style:{background:"#f9f9f9",height:"100%"},children:(0,e.jsxs)(U.Z,{gutter:[16,8],children:[(0,e.jsxs)(x.Z,{xs:24,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u5730\u5740"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace",wordBreak:"break-all"},children:fe.ipv6Address||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u5B50\u7F51\u63A9\u7801"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.netmask||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"IPv6\u7F51\u5173"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.gateway||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"DHCPv6\u670D\u52A1\u5668"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.dhcpServer||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u9996\u9009DNSv6"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.primaryDNS||"\u672A\u83B7\u53D6"})]}),(0,e.jsxs)(x.Z,{xs:24,sm:12,children:[(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",marginBottom:"4px"},children:"\u5907\u7528DNSv6"}),(0,e.jsx)("div",{style:{fontSize:"14px",fontWeight:500,fontFamily:"monospace"},children:fe.secondaryDNS||"\u672A\u83B7\u53D6"})]})]})})})]})})}),(0,e.jsx)(x.Z,{xs:24,children:(0,e.jsx)(L.Z,{title:(0,e.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,e.jsx)("span",{children:"\u6A21\u7EC4\u6E29\u5EA6\u76D1\u63A7"}),(0,e.jsx)("div",{style:{fontSize:"12px",color:"#666",background:"#f5f5f5",padding:"2px 8px",borderRadius:"4px",fontWeight:"normal"},children:"5G\u6A21\u7EC4\u5404\u529F\u80FD\u6A21\u5757\u6E29\u5EA6\u72B6\u6001"})]}),extra:(0,e.jsxs)(pe.ZP,{type:"link",size:"small",style:{padding:"0 8px",height:"28px",display:"flex",alignItems:"center",gap:"4px",background:R.tempMonitor.enabled?"#e6f7ff":"transparent",border:"1px solid #91d5ff",borderRadius:"4px"},onClick:function(n){n.target.closest(".ant-input-number")||le("tempMonitor",!R.tempMonitor.enabled,R.tempMonitor.interval)},children:[(0,e.jsx)("span",{children:"\u81EA\u52A8\u5237\u65B0"}),R.tempMonitor.enabled&&(0,e.jsx)(Se.Z,{min:1,max:60,value:R.tempMonitor.interval,onChange:function(n){return le("tempMonitor",!0,n||5)},style:{width:45},size:"small",bordered:!1}),R.tempMonitor.enabled&&(0,e.jsx)("span",{children:"\u79D2"})]}),className:"inner-card",bodyStyle:{padding:"24px"},children:(0,e.jsxs)(U.Z,{gutter:[16,16],children:[(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(L.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["3G PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u529F\u653E\u6E29\u5EA6)"})]}),value:W.sub3GPA,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:W.sub3GPA<=45?"#52c41a":W.sub3GPA<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(L.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["6G PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u529F\u653E\u6E29\u5EA6)"})]}),value:W.sub6GPA,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:W.sub6GPA<=45?"#52c41a":W.sub6GPA<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(L.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["MIMO PA\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u591A\u5165\u591A\u51FA\u529F\u653E)"})]}),value:W.mimoPa,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:W.mimoPa<=45?"#52c41a":W.mimoPa<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(L.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["TCXO\u6E29\u5EA6 ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u6676\u632F\u6E29\u5EA6)"})]}),value:W.tcxo,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:W.tcxo<=45?"#52c41a":W.tcxo<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(L.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["AP1\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u5E94\u7528\u5904\u7406\u56681)"})]}),value:W.ap1,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:W.ap1<=45?"#52c41a":W.ap1<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(L.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["AP2\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u5E94\u7528\u5904\u7406\u56682)"})]}),value:W.ap2,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:W.ap2<=45?"#52c41a":W.ap2<=65?"#faad14":"#ff4d4f"}})})}),(0,e.jsx)(x.Z,{xs:24,sm:12,md:8,lg:6,children:(0,e.jsx)(L.Z,{size:"small",bordered:!1,className:"temperature-card",style:{background:"#ffffff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"1px solid #f0f0f0",transition:"all 0.3s ease"},hoverable:!0,children:(0,e.jsx)(V.Z,{title:(0,e.jsxs)("span",{children:["Modem1\u6E29\u5EA6"," ",(0,e.jsx)("span",{style:{fontSize:"12px",color:"#666"},children:"(\u8C03\u5236\u89E3\u8C03\u56681)"})]}),value:W.modem1,suffix:"\xB0C",valueStyle:{fontSize:"24px",fontWeight:500,color:W.modem1<=45?"#52c41a":W.modem1<=65?"#faad14":"#ff4d4f"}})})})]})})})]}),(0,e.jsx)("style",{dangerouslySetInnerHTML:{__html:`
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
      `})]})};qe.default=ar}}]);
