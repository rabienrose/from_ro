import React, { useEffect, useRef } from "react";

const WebGLTriangle = ({ triangleCount }) => {
  const canvasRef = useRef(null);
  

  useEffect(() => {
    console.log("ss",triangleCount);
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // 顶点着色器代码
    const vertexShaderSource = `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      varying lowp vec4 vColor;
      void main() {
        gl_Position = aVertexPosition;
        vColor = aVertexColor;
      }
    `;

    // 片段着色器代码
    const fragmentShaderSource = `
      varying lowp vec4 vColor;
      void main() {
        gl_FragColor = vColor;
      }
    `;

    // 创建顶点着色器
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // 创建片段着色器
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // 创建着色器程序
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Shader program failed to link");
      return;
    }

    gl.useProgram(shaderProgram);

    // 随机生成三角形的顶点、颜色和大小
    const generateTriangles = (count) => {
      const triangles = [];
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      for (let i = 0; i < count; i++) {
        const size = Math.random() * 0.1 + 0.05; // 随机大小，范围在0.05到0.15之间
        const x = Math.random() * 2 - 1; // 随机x位置，范围在-1到1之间
        const y = Math.random() * 2 - 1; // 随机y位置，范围在-1到1之间
        const color = [
          Math.random(), // 随机红色分量
          Math.random(), // 随机绿色分量
          Math.random(), // 随机蓝色分量
          1.0, // 透明度为1
        ];

        triangles.push({
          vertices: [
            x, y + size, 0.0, // 顶点1
            x - size, y - size, 0.0, // 顶点2
            x + size, y - size, 0.0, // 顶点3
          ],
          color,
        });
      }

      return triangles;
    };

    // 生成三角形数据
    const triangles = generateTriangles(triangleCount);

    // 创建顶点缓冲区
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 创建颜色缓冲区
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // 设置顶点和颜色数据
    let vertices = [];
    let colors = [];
    triangles.forEach((triangle) => {
      vertices = vertices.concat(triangle.vertices);
      colors = colors.concat(triangle.color, triangle.color, triangle.color);
    });

    // 绑定顶点缓冲区并传递数据
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // 绑定颜色缓冲区并传递数据
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const colorAttributeLocation = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    // 清除画布并绘制三角形
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // 设置背景颜色为黑色 
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
  }, [triangleCount]);

  return <canvas ref={canvasRef} width="400" height="400" />;
};

export default WebGLTriangle;