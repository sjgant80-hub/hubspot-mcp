#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const TOOLS = [
  {
    "name": "getCrmV3ObjectsContactsGetPage",
    "description": "GET /crm/v3/objects/contacts · Retrieve contacts",
    "inputSchema": {
      "type": "object",
      "properties": {
        "after": {
          "type": "string"
        },
        "archived": {
          "type": "string"
        },
        "associations": {
          "type": "string"
        },
        "limit": {
          "type": "string"
        },
        "properties": {
          "type": "string"
        },
        "propertiesWithHistory": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "postCrmV3ObjectsContactsCreate",
    "description": "POST /crm/v3/objects/contacts · Create a contact",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "postCrmV3ObjectsContactsBatchArchiveArchive",
    "description": "POST /crm/v3/objects/contacts/batch/archive · Archive a batch of contacts",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "postCrmV3ObjectsContactsBatchCreateCreate",
    "description": "POST /crm/v3/objects/contacts/batch/create · Create a batch of contacts",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "postCrmV3ObjectsContactsBatchReadRead",
    "description": "POST /crm/v3/objects/contacts/batch/read · Retrieve a batch of contacts",
    "inputSchema": {
      "type": "object",
      "properties": {
        "archived": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "postCrmV3ObjectsContactsBatchUpdateUpdate",
    "description": "POST /crm/v3/objects/contacts/batch/update · Update a batch of contacts",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "postCrmV3ObjectsContactsBatchUpsertUpsert",
    "description": "POST /crm/v3/objects/contacts/batch/upsert · Create or update a batch of contacts",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "postCrmV3ObjectsContactsGdprDeletePurge",
    "description": "POST /crm/v3/objects/contacts/gdpr-delete · Permanently delete a contact (GDPR-compliant)",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "postCrmV3ObjectsContactsMergeMerge",
    "description": "POST /crm/v3/objects/contacts/merge · Merge two contacts",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "postCrmV3ObjectsContactsSearchDoSearch",
    "description": "POST /crm/v3/objects/contacts/search · Search for contacts",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "getCrmV3ObjectsContactsContactIdGetById",
    "description": "GET /crm/v3/objects/contacts/{contactId} · Retrieve a contact",
    "inputSchema": {
      "type": "object",
      "properties": {
        "contactId": {
          "type": "string"
        },
        "archived": {
          "type": "string"
        },
        "associations": {
          "type": "string"
        },
        "idProperty": {
          "type": "string"
        },
        "properties": {
          "type": "string"
        },
        "propertiesWithHistory": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "patchCrmV3ObjectsContactsContactIdUpdate",
    "description": "PATCH /crm/v3/objects/contacts/{contactId} · Update a contact",
    "inputSchema": {
      "type": "object",
      "properties": {
        "contactId": {
          "type": "string"
        },
        "idProperty": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "deleteCrmV3ObjectsContactsContactIdArchive",
    "description": "DELETE /crm/v3/objects/contacts/{contactId} · Archive a contact",
    "inputSchema": {
      "type": "object",
      "properties": {
        "contactId": {
          "type": "string"
        }
      }
    }
  }
];
const UPSTREAM = process.env.UPSTREAM || 'https://api.hubapi.com';
const APIKEY = process.env.HUBSPOT_KEY || process.env.API_KEY || '';

const server = new Server({ name: 'hubspot-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = TOOLS.find(t => t.name === req.params.name);
  if (!tool) throw new Error('unknown tool');
  const args = req.params.arguments || {};
  const path = tool.description.match(/(GET|POST|PUT|PATCH|DELETE) (\S+)/) || [];
  const method = path[1] || 'GET';
  let url = new URL(path[2] || '/', UPSTREAM);
  for (const [k, v] of Object.entries(args)) if (typeof v === 'string' && url.pathname.includes('{' + k + '}')) url.pathname = url.pathname.replace('{' + k + '}', v);
  const opts = { method, headers: { Authorization: APIKEY ? 'Bearer ' + APIKEY : '' } };
  if (method !== 'GET' && Object.keys(args).length) { opts.body = JSON.stringify(args); opts.headers['Content-Type'] = 'application/json'; }
  const res = await fetch(url, opts);
  const txt = await res.text();
  return { content: [{ type: 'text', text: txt.slice(0, 4000) }] };
});

await server.connect(new StdioServerTransport());
console.error('hubspot-mcp v1.0.0 · stdio ready · 13 tools');
