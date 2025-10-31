'use client'

import { useState } from 'react'

export default function Home() {
  const [copied, setCopied] = useState(false)

  const workflow = {
    "name": "WhatsApp Audio Transcription",
    "nodes": [
      {
        "parameters": {
          "httpMethod": "POST",
          "path": "whatsapp-webhook",
          "responseMode": "responseNode",
          "options": {}
        },
        "id": "webhook-whatsapp",
        "name": "WhatsApp Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1.1,
        "position": [250, 300],
        "webhookId": "whatsapp-audio"
      },
      {
        "parameters": {
          "conditions": {
            "string": [
              {
                "value1": "={{$json.message.type}}",
                "operation": "equals",
                "value2": "audio"
              }
            ]
          }
        },
        "id": "check-audio",
        "name": "Check if Audio",
        "type": "n8n-nodes-base.if",
        "typeVersion": 1,
        "position": [470, 300]
      },
      {
        "parameters": {
          "url": "={{$json.message.audio.link}}",
          "options": {
            "response": {
              "response": {
                "responseFormat": "file"
              }
            }
          }
        },
        "id": "download-audio",
        "name": "Download Audio",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.1,
        "position": [690, 200]
      },
      {
        "parameters": {
          "operation": "transcribe",
          "options": {
            "language": "en",
            "model": "whisper-1"
          }
        },
        "id": "transcribe-audio",
        "name": "Transcribe with OpenAI Whisper",
        "type": "n8n-nodes-base.openAi",
        "typeVersion": 1.2,
        "position": [910, 200],
        "credentials": {
          "openAiApi": {
            "id": "1",
            "name": "OpenAI API"
          }
        }
      },
      {
        "parameters": {
          "method": "POST",
          "url": "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages",
          "authentication": "genericCredentialType",
          "genericAuthType": "httpHeaderAuth",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "bodyParameters": {
            "parameters": [
              {
                "name": "messaging_product",
                "value": "whatsapp"
              },
              {
                "name": "to",
                "value": "={{$node['WhatsApp Webhook'].json.message.from}}"
              },
              {
                "name": "type",
                "value": "text"
              },
              {
                "name": "text",
                "value": "={{JSON.stringify({body: $json.text})}}"
              }
            ]
          },
          "options": {}
        },
        "id": "send-transcription",
        "name": "Send Transcription to WhatsApp",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.1,
        "position": [1130, 200]
      },
      {
        "parameters": {
          "respondWith": "json",
          "responseBody": "={{JSON.stringify({status: 'success', transcription: $json.text})}}",
          "options": {
            "responseHeaders": {
              "entries": [
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            }
          }
        },
        "id": "respond-success",
        "name": "Respond Success",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1.1,
        "position": [1350, 200]
      },
      {
        "parameters": {
          "respondWith": "json",
          "responseBody": "={{JSON.stringify({status: 'skipped', message: 'Not an audio message'})}}",
          "options": {}
        },
        "id": "respond-skip",
        "name": "Respond Skip",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1.1,
        "position": [690, 400]
      }
    ],
    "connections": {
      "WhatsApp Webhook": {
        "main": [
          [
            {
              "node": "Check if Audio",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Check if Audio": {
        "main": [
          [
            {
              "node": "Download Audio",
              "type": "main",
              "index": 0
            }
          ],
          [
            {
              "node": "Respond Skip",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Download Audio": {
        "main": [
          [
            {
              "node": "Transcribe with OpenAI Whisper",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Transcribe with OpenAI Whisper": {
        "main": [
          [
            {
              "node": "Send Transcription to WhatsApp",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Send Transcription to WhatsApp": {
        "main": [
          [
            {
              "node": "Respond Success",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "pinData": {},
    "settings": {
      "executionOrder": "v1"
    },
    "staticData": null,
    "tags": [],
    "triggerCount": 0,
    "updatedAt": "2025-10-31T00:00:00.000Z",
    "versionId": "1"
  }

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'whatsapp-audio-transcription-workflow.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          padding: '40px',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700' }}>
            WhatsApp Audio Transcription
          </h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.95 }}>
            n8n Workflow for automatic audio-to-text conversion
          </p>
        </div>

        <div style={{ padding: '40px' }}>
          <div style={{
            background: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#333' }}>
              📋 Workflow Features
            </h2>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
              <li><strong>Webhook Trigger:</strong> Receives WhatsApp messages via webhook</li>
              <li><strong>Audio Detection:</strong> Automatically filters audio messages</li>
              <li><strong>Download Handler:</strong> Fetches audio files from WhatsApp servers</li>
              <li><strong>OpenAI Whisper:</strong> Transcribes audio to text with high accuracy</li>
              <li><strong>Auto-Reply:</strong> Sends transcription back to WhatsApp chat</li>
              <li><strong>Response Handling:</strong> Returns status via webhook response</li>
            </ul>
          </div>

          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#856404' }}>
              ⚠️ Setup Requirements
            </h3>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404', lineHeight: '1.7', fontSize: '14px' }}>
              <li>Import this workflow into your n8n instance</li>
              <li>Configure OpenAI API credentials (for Whisper transcription)</li>
              <li>Set up WhatsApp Business API access token</li>
              <li>Update the Phone Number ID in "Send Transcription" node</li>
              <li>Configure the webhook URL in WhatsApp Business settings</li>
              <li>Activate the workflow</li>
            </ol>
          </div>

          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              📥 Download Workflow JSON
            </button>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                background: copied ? '#28a745' : 'white',
                color: copied ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>

          <details style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              color: '#333',
              fontSize: '16px',
              marginBottom: '15px'
            }}>
              🔧 Workflow JSON Preview
            </summary>
            <pre style={{
              background: '#282c34',
              color: '#abb2bf',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              margin: '15px 0 0 0',
              maxHeight: '400px'
            }}>
              {JSON.stringify(workflow, null, 2)}
            </pre>
          </details>

          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#e7f3ff',
            borderRadius: '8px',
            borderLeft: '4px solid #2196F3'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#1565c0' }}>
              💡 How It Works
            </h3>
            <p style={{ margin: 0, color: '#555', lineHeight: '1.7', fontSize: '14px' }}>
              When a WhatsApp audio message is received, the workflow checks if it's an audio type,
              downloads the file, sends it to OpenAI Whisper for transcription, and automatically
              replies with the text version. Perfect for accessibility, documentation, or when you
              can't listen to audio messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
