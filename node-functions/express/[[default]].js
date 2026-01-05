import express from "express";
import formidable from 'formidable';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { Buffer } from 'buffer';

const app = express();

const apiKey = "app-iED3oMZNrWiKtXu5T5ASim2c";
const baseTarget = 'http://api.dify.woa.com/v1/';

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 根路由
app.get("/", async (req, res) => {
  res.json({ message: "Hello from Express on Node Functions!"});
});
app.get("/info", async (req, res) => {
  const target = baseTarget + 'info';
        const fetchResponse = await fetch(baseTarget, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          // 如果需透传用户请求头，也可以在这里添加
        }
      });
    const responseJson = await fetchResponse.json();
  res.json({ message: "Hello from Express on Node Functions!", apiResponse: responseJson });
});


app.post("/upload", async (req, res) => {
  try {
    const target = baseTarget + 'files/upload';
    
    // 获取原始请求头，保留boundary等multipart相关信息
    const headers = {
      'Content-Type': req.headers['content-type'],
      Authorization: `Bearer ${apiKey}`,
    };

    // 流式读取原始请求体并转发
    const rawBody = await readRawBody(req);
    
    const fetchResponse = await fetch(target, {
      method: 'POST',
      headers: headers,
      body: rawBody, // 使用读取的原始Buffer
    });

    const responseJson = await fetchResponse.json();
    res.status(fetchResponse.status).json({ 
      message: "Upload processed successfully", 
      apiResponse: responseJson 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

app.post("/run/fire", async (req, res) => {
  try {
    const target = baseTarget + 'workflows/run';
    const rawBody = await readRawBody(req);

    const fetchResponse = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: rawBody,
    });

    const responseJson = await fetchResponse.json();
    res.status(fetchResponse.status).json({ 
      message: "Workflow executed successfully", 
      apiResponse: responseJson 
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({ error: 'Workflow execution failed', details: error.message });
  }
});

app.post("/run/normal", async (req, res) => {
  try {
    const target = baseTarget + 'workflows/run';
    const rawBody = await readRawBody(req);
    const fetchResponse = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: rawBody,
    });

    const responseJson = await fetchResponse.json();
    res.status(fetchResponse.status).json({ 
      message: "Normal workflow executed successfully", 
      apiResponse: responseJson 
    });
  } catch (error) {
    console.error('Normal workflow execution error:', error);
    res.status(500).json({ error: 'Normal workflow execution failed', details: error.message });
  }
});
// 读取原始请求体
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    req.on('data', (chunk) => buffers.push(chunk));
    req.on('end', () => resolve(Buffer.concat(buffers)));
    req.on('error', reject);
  });
}


// // // 启动服务
// // const port = process.env.PORT || 3000;
// // app.listen(port, () => {
// //   console.log(`Express server running on port ${port}`);
// // });
export default app;