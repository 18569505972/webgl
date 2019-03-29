window.onload = function() {
    var c = document.getElementById("canvas")
    c.width = 500
    c.height = 500
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl')
    // 创建着色器
    var v_shader = create_shader('x-vertex')
    var f_shader = create_shader('x-fragment')
    // 生成着色器程序对象并链接
    var prg = create_program(v_shader, f_shader)
    // 获取attribute变量存储序号
    var attrLocation = new Array(2);
    attrLocation[0] = gl.getAttribLocation(prg, 'position');
    attrLocation[1] = gl.getAttribLocation(prg, 'color');
    // attribute变量有几位元素
    var attrStride = new Array(2);
    attrStride[0] = 3
    attrStride[1] = 4
    // 创建模型位置数据矩阵
    var vertex_position = [
        //x,y,z
        0.0, 1.0, 0.0,
        1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, 1.0, 1.0,
        1.0, 0.0, 1.0,
        -1.0, 0.0, 1.0,
        0.0, -1.0, 1.0,
    ]
    // 创建模型颜色数据矩阵
    var vertex_color = [
        //x,y,z
        0.0, 1.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 0.0, 0.0,
    ]
    // 创建顶点索引数据矩阵
    var index = [
        0, 1, 2,
        1, 2, 3,
        0, 5, 6,
        0, 2, 6,
        4, 5, 6,
        4, 6, 7,
        7, 3, 4,
        3, 4, 1,
        3, 2, 6,
        3, 6, 7,
        1, 4, 5,
        1, 0, 5
    ]
    var position_vbo = create_vbo(vertex_position)
    var color_vbo = create_vbo(vertex_color)
    set_attribute([position_vbo, color_vbo], attrLocation, attrStride);
    // 创建顶点索引数据缓存
    var ibo = create_ibo(index)
    // 添加并绑定ibo缓存
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    // 获取uniform变量mvpMatrix存储号
    var uniformLocation = gl.getUniformLocation(prg, 'mvpMatrix');
    // 生成matIV对象
    var m = new matIV();
    // 矩阵初始化
    var Matrix = m.identity(m.create());
    // 模型变换顺序：移动>旋转>扩大缩小
    // 各种矩阵的生成和初始化，相乘顺序p,v,m
    var mMatrix = m.identity(m.create()); // 模型变换矩阵
    var vMatrix = m.identity(m.create()); // 视图变换矩阵
    var pMatrix = m.identity(m.create()); // 投影变换矩阵
    var temMatrix = m.identity(m.create()); // 投影变换矩阵
    var mvpMatrix = m.identity(m.create()); // 临时坐标变换矩阵
    // 视图变换矩阵参数设置，参数一镜头位置，参数二参考点，参数三镜头方向
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix)
    // 投影变换矩阵初始化，视角，屏幕比例，近截面，远截面
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix)
    // 各个矩阵相乘的顺序使用示例
    m.multiply(pMatrix, vMatrix, temMatrix); // p和v相乘
    var count = 0;
    (function() {
        // 设置清空画布的颜色
        gl.clearColor(0.155, 0.0, 0.28, 1.0)
        // 清理画布深度
        gl.clearDepth(1.0)
        // 用设置颜色清空画布
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        count++
        // 旋转角
        var rad = (count % 360) * Math.PI / 180
        // 半径
        var r = 1.5
        // 半径为5的圆形，x,y坐标
        var x = r * Math.cos(rad)
        var y = r * Math.sin(rad)
        // 模型二
        m.identity(mMatrix)
        m.translate(mMatrix, [0.0, 0.0, 0.0], mMatrix)
        m.rotate(mMatrix, rad, [0.0, 1.5, 0.0], mMatrix)
        m.multiply(temMatrix, mMatrix, mvpMatrix); // 然后和m相乘
        gl.uniformMatrix4fv(uniformLocation, false, mvpMatrix);
        // 绘制模型，参数一，顶点绘制常量TRIANGLES：三角形；参数二，索引元素数；参数三：索引数据大小；参数四，绘制起始位置
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)
        // context刷新
        gl.flush()
        setTimeout(arguments.callee, 1000 / 50)
    })()
    // 绑定数据缓存
    function set_attribute(vbo, attL, attS) {
        for (var i in vbo) {
            // 绑定模型数据缓存
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i])
            // 设置attribute变量生效
            gl.enableVertexAttribArray(attL[i])
            // 添加attribute属性TRIANGLES
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
    }
    // id着色器script代码
    function create_shader(id) {
        var shader
        var scriptElement = document.getElementById(id)
        if (!scriptElement) { return; }
        switch (scriptElement.type) {
            // 创建顶点着色器
            case 'x-shader/x-vertex':
                shader = gl.createShader(gl.VERTEX_SHADER)
                break;
                // 创建片段着色器
            case 'x-shader/x-fragment':
                shader = gl.createShader(gl.FRAGMENT_SHADER)
                break;
            default:
                return;
        }
        // 生成着色器加载着色代码
        gl.shaderSource(shader, scriptElement.text)
        // 编译着色器
        gl.compileShader(shader)
        // 判断着色器是否编译完成
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader
        } else {
            // 失败弹出失败信息
            alert(gl.getShaderInfoLog(shader))
        }
    }
    // vs顶点着色器，fs片段着色器
    function create_program(vs, fs) {
        // 创建程序对象
        var program = gl.createProgram()
        // 向程序对象分配着色器
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        // 链接着色器，是着色器可以通讯
        gl.linkProgram(program)
        // 判断顶点及片段着色器是否链接成功
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            // 启用程序
            gl.useProgram(program)
            return program
        } else {
            // 链接程序错误
            alert(gl.getProgramInfoLog(program))
        }
    }
    // 创建顶点数据缓存写入显卡，data矩阵
    function create_vbo(data) {
        // 生成缓存对象
        var vbo = gl.createBuffer()
        //绑定缓存对象
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        // 写入缓存数据
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
        // 将绑定缓存设置为无效
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        return vbo
    }
    // 创建顶点索引数据缓存写入显卡，data矩阵
    function create_ibo(data) {
        // 生成缓存对象
        var ibo = gl.createBuffer()
        //绑定缓存对象
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
        // 写入缓存数据
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
        // 将绑定缓存设置为无效
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        return ibo
    }
}