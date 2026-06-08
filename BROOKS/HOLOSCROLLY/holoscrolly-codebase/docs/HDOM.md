# HDOM — Holonic Document Object Model

The page is not a tree of tags. It is a **living forest of holons**. Each node is
simultaneously a whole and a part, and it knows where it is in its own becoming.

## The canonical question

> **Where am I in becoming?**

Every HDOM node must be able to answer it.

## Node anatomy (`src/types/hdom.ts`)

| Field | Meaning |
| --- | --- |
| `id` | Stable identity across revisions and return events. |
| `kind` | `root \| chapter \| scene \| step \| move \| memory \| diagnosis \| invitation \| return-event` |
| `state` | `latent → revealed → active → integrating → remembered → evolving` |
| `domain` | One of the eight HOLOBAGUA domains. |
| `hurl` | The node's address-of-becoming (optional; root always carries one). |
| `summary` | What this holon is, in one breath. |
| `history` | What it has been. |
| `trajectory` | `from → through[] → toward`, plus `nextBestStep`. |
| `relationships` | Sibling and cross-tree resonances by `id`. |
| `children` | Nested holons (each a complete HDOM). |
| `memory` | `visits`, timestamps, `lastReturnPrompt`, `notes[]`. |

## State lifecycle

```
latent ──reveal──▶ revealed ──summon──▶ active ──integrate──▶ integrating
                                              │
                                              ▼
                                        remembered ──return──▶ evolving
```

## Design rule

**Every visible major section maps to exactly one HdomNode.** If something is on
screen and is not a node, it does not exist to the organism — it cannot remember,
relate, or evolve.

## Write-back

The Return Event and the SoulSeed Compass both write into `node.memory.notes`,
prefixed by source (`[return] …`, `[soulseed:branch] …`). Memory is how the
document earns the word *relationship*.
