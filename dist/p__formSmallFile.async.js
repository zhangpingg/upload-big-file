(self.webpackChunk=self.webpackChunk||[]).push([[910],{4463:function(R,u,e){"use strict";e.r(u);var p=e(15009),o=e.n(p),f=e(99289),v=e.n(f),P=e(5574),i=e.n(P),M=e(67294),s=e(25930),t=e(98982),O=e(11889),F=e(12294),b=e(11238),_=e(85893),h=function(){var c=s.Z.useForm(),j=i()(c,1),m=j[0],g=(0,M.useState)(""),d=i()(g,2),I=d[0],C=d[1],T=function(l){C(l.target.files[0])},A=function(){var E=v()(o()().mark(function l(){var r,a,D;return o()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return r=m.getFieldsValue(!0),a=new FormData,a.append("name",r.name),a.append("age",r.age),a.append("picName","pic"),a.append("pic",I),console.log(a),n.next=9,(0,b.ZP)("http://localhost:9000/submitForm",{method:"post",data:a});case 9:D=n.sent,console.log(D);case 11:case"end":return n.stop()}},l)}));return function(){return E.apply(this,arguments)}}();return(0,_.jsxs)(s.Z,{form:m,children:[(0,_.jsx)(s.Z.Item,{label:"\u540D\u79F0",name:"name",children:(0,_.jsx)(t.Z,{})}),(0,_.jsx)(s.Z.Item,{label:"\u5E74\u9F84",name:"age",children:(0,_.jsx)(t.Z,{})}),(0,_.jsx)(s.Z.Item,{label:"\u5E74\u9F84",children:(0,_.jsx)(t.Z,{type:"file",onChange:T})}),(0,_.jsx)(O.Z,{type:"primary",onClick:A,children:"\u63D0\u4EA4"})]})};u.default=h},24654:function(){}}]);