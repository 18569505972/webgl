/* attribute接受单一不同顶点的不同信息，vec3代表三维向量 */
attribute vec3 position;
attribute vec4 color; 
// uniform传递所有顶点信息矩阵，矩阵为模型，视图，投影的各个变换矩阵结合后的矩阵 
// mat4代表4*4矩阵
uniform mat4 mvpMatrix;
/* //顶点着色器向片段着色器转递值 */
varying vec4 vColor;
void main(void){ 
    vColor = color;
    gl_Position = mvpMatrix*vec4(position,1.0);
}