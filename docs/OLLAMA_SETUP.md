# Ollama Setup Guide

Complete guide to installing and using Ollama with the Tasks Generator app.

---

## What is Ollama?

Ollama lets you run large language models locally on your machine without any cloud API. Perfect for:
- Offline work
- Zero cost (no API fees)
- Full privacy (data never leaves your machine)
- No rate limits

---

## Installation

### On Your Local Machine (Windows/Mac/Linux)

**1. Install Ollama**

Visit https://ollama.com/download and download the installer for your OS.

Or via command line:

**Linux / WSL:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Mac (Homebrew):**
```bash
brew install ollama
```

**Windows:**
Download from https://ollama.com/download/windows

**2. Verify Installation**
```bash
ollama --version
```

You should see something like `ollama version 0.x.x`

**3. Pull Models**

Download the models you want to use:

```bash
# Llama 3.2 (3B, fast, good for most tasks)
ollama pull llama3.2

# Mistral (7B, slower but better quality)
ollama pull mistral

# Gemma 2 (2B, very fast)
ollama pull gemma2:2b

# DeepSeek Coder (for coding tasks)
ollama pull deepseek-coder

# Check available models
ollama list
```

**4. Test Ollama**
```bash
ollama run llama3.2
```

Type a message and press Enter. The model should respond. Type `/bye` to exit.

**5. Verify API is Running**

Ollama runs on `http://localhost:11434` by default:

```bash
curl http://localhost:11434/api/tags
```

You should see JSON with your installed models.

---

## On Your VPS (Remote Server)

### Option 1: Run Ollama Directly on VPS

**1. Install Ollama on VPS**
```bash
ssh your-vps
curl -fsSL https://ollama.com/install.sh | sh
```

**2. Pull models**
```bash
ollama pull llama3.2
ollama pull mistral
```

**3. Run Ollama as a service**

Ollama automatically starts as a systemd service on Linux:

```bash
# Check status
systemctl status ollama

# Enable on boot
sudo systemctl enable ollama

# Restart
sudo systemctl restart ollama
```

**4. Configure your app**

In your `.env` file on the VPS:
```bash
OLLAMA_URL=http://localhost:11434
```

Then restart your app:
```bash
docker-compose restart
```

**5. Test from your app**

Go to your deployed app → Select "Ollama: Llama 3.2" → Generate a spec.

---

### Option 2: Use Ollama from Local Machine + VPS App

This setup lets you:
- Run Ollama on your powerful local machine
- App runs on VPS
- App connects to your local Ollama via tunnel

**1. Install Ollama on your local machine** (see above)

**2. Create SSH tunnel from VPS to your local Ollama**

On your **VPS**, create a reverse SSH tunnel:

```bash
# Run this on your VPS (replace 123.45.67.89 with your home IP)
ssh -R 11434:localhost:11434 your-home-username@your-home-ip

# Or use ngrok on your local machine:
# 1. Install ngrok: https://ngrok.com/download
# 2. Run: ngrok http 11434
# 3. Copy the https URL (e.g. https://abc123.ngrok.io)
```

**3. Update .env on VPS**

```bash
# If using SSH tunnel
OLLAMA_URL=http://localhost:11434

# If using ngrok
OLLAMA_URL=https://abc123.ngrok.io
```

**4. Restart app**
```bash
docker-compose restart
```

⚠️ **Security Warning:** Exposing Ollama over the internet (ngrok) means anyone with the URL can use your Ollama. Use SSH tunnels or VPN for production.

---

## Configuration in Tasks Generator

### Local Development

**1. Start Ollama (if not running)**
```bash
# Ollama usually auto-starts after install
# If not, run:
ollama serve
```

**2. Update `.env`**
```bash
OLLAMA_URL=http://localhost:11434
```

**3. Start your app**
```bash
npm run dev:api  # Terminal 1
npm run dev      # Terminal 2
```

**4. Select Ollama model in UI**

- Go to http://localhost:5173
- Select "Ollama: Llama 3.2" from dropdown
- Fill form and generate

---

### Docker Deployment

**1. Pull Ollama models on host**
```bash
ollama pull llama3.2
ollama pull mistral
```

**2. Update `docker-compose.yml`**

If Ollama is running on the **same machine** as Docker:

```yaml
services:
  app:
    environment:
      - OLLAMA_URL=http://host.docker.internal:11434
```

If Ollama is on a **different machine**:

```yaml
services:
  app:
    environment:
      - OLLAMA_URL=http://192.168.1.100:11434  # Replace with Ollama machine IP
```

**3. Deploy**
```bash
docker-compose up -d
```

---

## Model Recommendations

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| `llama3.2` | 3B | ⚡⚡⚡ | ⭐⭐⭐ | Best for quick tasks |
| `mistral` | 7B | ⚡⚡ | ⭐⭐⭐⭐ | Better quality, slower |
| `gemma2:2b` | 2B | ⚡⚡⚡⚡ | ⭐⭐ | Fastest, lower quality |
| `deepseek-coder` | 6.7B | ⚡⚡ | ⭐⭐⭐⭐ | Best for coding tasks |
| `llama3.2:70b` | 70B | ⚡ | ⭐⭐⭐⭐⭐ | Highest quality (needs powerful GPU) |

---

## Troubleshooting

### "Ollama error: connection refused"

**Cause:** Ollama is not running.

**Fix:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If it fails, start Ollama
ollama serve

# Or restart the service
sudo systemctl restart ollama
```

---

### "Model not found"

**Cause:** Model not downloaded.

**Fix:**
```bash
# List installed models
ollama list

# Pull missing model
ollama pull llama3.2
```

---

### "Empty response from Ollama"

**Cause:** Model might be too small or prompt too complex.

**Fix:**
1. Try a larger model: `ollama pull mistral`
2. Switch to `deepseek-coder` for coding tasks
3. Use OpenRouter models instead (cloud-based)

---

### Ollama works locally but not from Docker

**Cause:** Docker can't reach `localhost:11434` of the host machine.

**Fix:**

Use `host.docker.internal` instead:
```bash
OLLAMA_URL=http://host.docker.internal:11434
```

Or use host network mode (Linux only):
```yaml
services:
  app:
    network_mode: host
```

---

### Ollama on VPS but app can't connect

**Check firewall:**
```bash
sudo ufw allow 11434
```

**Check Ollama is listening on all interfaces:**
```bash
# Edit Ollama service
sudo systemctl edit ollama.service

# Add:
[Service]
Environment="OLLAMA_HOST=0.0.0.0"

# Restart
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

⚠️ **Security:** Only do this if Ollama is on a private network or behind a firewall.

---

## Performance Tips

### GPU Acceleration

Ollama auto-detects and uses GPU if available (NVIDIA, AMD, Apple Silicon).

**Check GPU usage:**
```bash
# While Ollama is running a query
nvidia-smi  # NVIDIA GPUs
rocm-smi    # AMD GPUs
```

### RAM Requirements

| Model Size | Minimum RAM |
|------------|-------------|
| 2B-3B | 8 GB |
| 7B | 16 GB |
| 13B | 32 GB |
| 70B | 64 GB + GPU |

### Speed up inference

1. Use smaller models (`llama3.2` instead of `mistral`)
2. Reduce `max_tokens` in API calls
3. Use quantized models (Ollama does this automatically)

---

## Advanced: Custom Models

You can create your own Ollama model with custom system prompts:

**1. Create a Modelfile**
```bash
cat > Modelfile <<EOF
FROM llama3.2

SYSTEM You are an expert software architect specializing in microservices.

PARAMETER temperature 0.7
PARAMETER top_p 0.9
EOF
```

**2. Build the model**
```bash
ollama create my-architect -f Modelfile
```

**3. Use in Tasks Generator**

Update `SpecForm.jsx`:
```javascript
{ id: 'ollama/my-architect', label: 'Custom Architect', provider: 'ollama', description: 'Custom model' }
```

---

## Summary

✅ **Local development:** Ollama runs on `http://localhost:11434`
✅ **Docker:** Use `OLLAMA_URL=http://host.docker.internal:11434`
✅ **VPS:** Install Ollama on VPS or tunnel from local machine
✅ **Recommended model:** `llama3.2` (fast, good quality, 3B size)

For more info: https://ollama.com/library
