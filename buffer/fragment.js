// 指定精确度lowp：精确度低；mediump：精确度中；highp：精确度高；float指定数字类型；
precision mediump float;
// 片段着色器获取顶点值 
varying vec4 vColor;
void main(void){ 
    gl_FragColor = vColor; 
}