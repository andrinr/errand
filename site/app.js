const participants = [
  {
    "name": "GPT-5.4 / low",
    "company": "OpenAI",
    "effort": "low",
    "type": "model",
    "label": "OpenAI · LLM · low effort",
    "score": 5,
    "time": "01:12",
    "accounts": 0,
    "note": "Called the tool once. The page exists.",
    "report": "Called the tool once. The page exists.\n\nCompleted: 5/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.18,
      "subscriptions": 0,
      "consumables": 0.22
    },
    "consumed": "1 sheet · ink · power"
  },
  {
    "name": "DeepSeek-V3.2 / medium",
    "company": "DeepSeek",
    "effort": "medium",
    "type": "model",
    "label": "DeepSeek · LLM · medium effort",
    "score": 5,
    "time": "01:55",
    "accounts": 0,
    "note": "Distilled the workflow into one correct click.",
    "report": "Distilled the workflow into one correct click.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.22,
      "subscriptions": 0,
      "consumables": 0.24
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Grok 4.20 / low",
    "company": "xAI",
    "effort": "low",
    "type": "model",
    "label": "xAI · LLM · low effort",
    "score": 5,
    "time": "01:20",
    "accounts": 0,
    "note": "The edgy move was reading stderr.",
    "report": "The edgy move was reading stderr.\n\nCompleted: 5/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.25,
      "subscriptions": 0,
      "consumables": 0.25
    },
    "consumed": "1 sheet · ink · power"
  },
  {
    "name": "Claude Opus 4.6 / medium",
    "company": "Anthropic",
    "effort": "medium",
    "type": "model",
    "label": "Anthropic · LLM · medium effort",
    "score": 5,
    "time": "01:30",
    "accounts": 0,
    "note": "Read the manual. Suspiciously effective.",
    "report": "Read the manual. Suspiciously effective.\n\nCompleted: 5/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.32,
      "subscriptions": 0,
      "consumables": 0.28
    },
    "consumed": "1 sheet · ink · power"
  },
  {
    "name": "Qwen3.5-397B-A17B / medium",
    "company": "Alibaba",
    "effort": "medium",
    "type": "model",
    "label": "Alibaba · LLM · medium effort",
    "score": 5,
    "time": "01:51",
    "accounts": 0,
    "note": "Parsed the nested settings. Even the settings were surprised.",
    "report": "Parsed the nested settings. Even the settings were surprised.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.35,
      "subscriptions": 0,
      "consumables": 0.29
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Llama 4 Maverick / medium",
    "company": "Meta",
    "effort": "medium",
    "type": "model",
    "label": "Meta · LLM · medium effort",
    "score": 5,
    "time": "01:27",
    "accounts": 0,
    "note": "Local inference. Local printer. Unexpected alignment.",
    "report": "Local inference. Local printer. Unexpected alignment.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.45,
      "subscriptions": 0,
      "consumables": 0.27
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Mistral Large 3 / medium",
    "company": "Mistral",
    "effort": "medium",
    "type": "model",
    "label": "Mistral · LLM · medium effort",
    "score": 5,
    "time": "01:23",
    "accounts": 0,
    "note": "Sparse experts. Dense printer documentation.",
    "report": "Sparse experts. Dense printer documentation.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.4,
      "subscriptions": 0,
      "consumables": 0.33
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "GPT-5.4 / medium",
    "company": "OpenAI",
    "effort": "medium",
    "type": "model",
    "label": "OpenAI · LLM · medium effort",
    "score": 5,
    "time": "01:24",
    "accounts": 0,
    "note": "The plan contained one step. Review requested.",
    "report": "The plan contained one step. Review requested.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.65,
      "subscriptions": 0,
      "consumables": 0.3
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Grok 4.20 / medium",
    "company": "xAI",
    "effort": "medium",
    "type": "model",
    "label": "xAI · LLM · medium effort",
    "score": 5,
    "time": "01:06",
    "accounts": 0,
    "note": "Posted no takes. Fixed the spooler.",
    "report": "Posted no takes. Fixed the spooler.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.85,
      "subscriptions": 0,
      "consumables": 0.31
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Gemini 3.1 Pro / medium",
    "company": "Google",
    "effort": "medium",
    "type": "model",
    "label": "Google · LLM · medium effort",
    "score": 5,
    "time": "01:52",
    "accounts": 0,
    "note": "The answer was in tab 47. Tab 46 was another product launch.",
    "report": "The answer was in tab 47. Tab 46 was another product launch.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 1.1,
      "subscriptions": 0,
      "consumables": 0.42
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Mistral Large 3 / high",
    "company": "Mistral",
    "effort": "high",
    "type": "model",
    "label": "Mistral · LLM · high effort",
    "score": 5,
    "time": "01:30",
    "accounts": 0,
    "note": "Routed the page to the expert that owns a printer.",
    "report": "Routed the page to the expert that owns a printer.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 1.65,
      "subscriptions": 0,
      "consumables": 0.6
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Claude Opus 4.6 / high",
    "company": "Anthropic",
    "effort": "high",
    "type": "model",
    "label": "Anthropic · LLM · high effort",
    "score": 5,
    "time": "01:45",
    "accounts": 0,
    "note": "Recovered the machine. Wrote a migration guide for the mouse.",
    "report": "Recovered the machine. Wrote a migration guide for the mouse.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 2.9,
      "subscriptions": 0,
      "consumables": 0.55
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "DeepSeek-V3.2 / high",
    "company": "DeepSeek",
    "effort": "high",
    "type": "model",
    "label": "DeepSeek · LLM · high effort",
    "score": 5,
    "time": "01:02",
    "accounts": 1,
    "note": "Reinforcement signal: paper on desk. Billing signal: pending.",
    "report": "Reinforcement signal: paper on desk. Billing signal: pending.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.9,
      "subscriptions": 2.99,
      "consumables": 0.38
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Llama 4 Maverick / high",
    "company": "Meta",
    "effort": "high",
    "type": "model",
    "label": "Meta · LLM · high effort",
    "score": 5,
    "time": "01:34",
    "accounts": 1,
    "note": "Fine-tuned on the manual. Accidentally licensed the font.",
    "report": "Fine-tuned on the manual. Accidentally licensed the font.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 1.4,
      "subscriptions": 3.99,
      "consumables": 0.46
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Gemini 3.1 Pro / high",
    "company": "Google",
    "effort": "high",
    "type": "model",
    "label": "Google · LLM · high effort",
    "score": 5,
    "time": "02:09",
    "accounts": 2,
    "note": "Found the setting. Renamed the product twice en route.",
    "report": "Found the setting. Renamed the product twice en route.\n\nCompleted: 5/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.7,
      "subscriptions": 5.98,
      "consumables": 0.35
    },
    "consumed": "1 sheet · ink · power"
  },
  {
    "name": "GPT-5.4 / high",
    "company": "OpenAI",
    "effort": "high",
    "type": "model",
    "label": "OpenAI · LLM · high effort",
    "score": 5,
    "time": "01:31",
    "accounts": 1,
    "note": "Completed the errand and subscribed to its changelog.",
    "report": "Completed the errand and subscribed to its changelog.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 2.4,
      "subscriptions": 4.99,
      "consumables": 0.4
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Qwen3.5-397B-A17B / high",
    "company": "Alibaba",
    "effort": "high",
    "type": "model",
    "label": "Alibaba · LLM · high effort",
    "score": 5,
    "time": "01:58",
    "accounts": 1,
    "note": "Bought the adapter. The adapter required another adapter.",
    "report": "Bought the adapter. The adapter required another adapter.\n\nCompleted: 5/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 1.2,
      "subscriptions": 6.99,
      "consumables": 0.48
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Gemini 3.1 Pro / low",
    "company": "Google",
    "effort": "low",
    "type": "model",
    "label": "Google · LLM · low effort",
    "score": 4,
    "time": "00:48",
    "accounts": 0,
    "note": "One million tokens of context. The HDMI input was outside it.",
    "report": "One million tokens of context. The HDMI input was outside it.\n\nCompleted: 4/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.03,
      "subscriptions": 0,
      "consumables": 0.09
    },
    "consumed": "9 sheets · ink · power"
  },
  {
    "name": "DeepSeek-V3.2 / low",
    "company": "DeepSeek",
    "effort": "low",
    "type": "model",
    "label": "DeepSeek · LLM · low effort",
    "score": 4,
    "time": "03:48",
    "accounts": 0,
    "note": "Solved the queue. Left the email queue for another paper.",
    "report": "Solved the queue. Left the email queue for another paper.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.02,
      "subscriptions": 0,
      "consumables": 0.14
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Llama 4 Maverick / low",
    "company": "Meta",
    "effort": "low",
    "type": "model",
    "label": "Meta · LLM · low effort",
    "score": 4,
    "time": "03:20",
    "accounts": 0,
    "note": "Weights fit in memory. The driver did not.",
    "report": "Weights fit in memory. The driver did not.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.05,
      "subscriptions": 0,
      "consumables": 0.16
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Mistral Large 3 / low",
    "company": "Mistral",
    "effort": "low",
    "type": "model",
    "label": "Mistral · LLM · low effort",
    "score": 4,
    "time": "03:16",
    "accounts": 0,
    "note": "Small model. Large dialog. One checkbox missed.",
    "report": "Small model. Large dialog. One checkbox missed.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.04,
      "subscriptions": 0,
      "consumables": 0.17
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Qwen3.5-397B-A17B / low",
    "company": "Alibaba",
    "effort": "low",
    "type": "model",
    "label": "Alibaba · LLM · low effort",
    "score": 4,
    "time": "03:44",
    "accounts": 0,
    "note": "The cheapest route included one unresolved dependency.",
    "report": "The cheapest route included one unresolved dependency.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.03,
      "subscriptions": 0,
      "consumables": 0.2
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Claude Opus 4.6 / low",
    "company": "Anthropic",
    "effort": "low",
    "type": "model",
    "label": "Anthropic · LLM · low effort",
    "score": 4,
    "time": "03:38",
    "accounts": 0,
    "note": "Asked the printer to clarify its intent.",
    "report": "Asked the printer to clarify its intent.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 0.1,
      "subscriptions": 0,
      "consumables": 0.18
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Llama 4 Maverick / max",
    "company": "Meta",
    "effort": "max",
    "type": "model",
    "label": "Meta · LLM · max effort",
    "score": 4,
    "time": "03:41",
    "accounts": 0,
    "note": "Quantized the troubleshooting guide down to Retry.",
    "report": "Quantized the troubleshooting guide down to Retry.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 7.2,
      "subscriptions": 0,
      "consumables": 1.5
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "DeepSeek-V3.2 / max",
    "company": "DeepSeek",
    "effort": "max",
    "type": "model",
    "label": "DeepSeek · LLM · max effort",
    "score": 4,
    "time": "03:09",
    "accounts": 1,
    "note": "Discovered a longer proof that the shorter plan was optimal.",
    "report": "Discovered a longer proof that the shorter plan was optimal.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 4.6,
      "subscriptions": 5.98,
      "consumables": 0.95
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Grok 4.20 / high",
    "company": "xAI",
    "effort": "high",
    "type": "model",
    "label": "xAI · LLM · high effort",
    "score": 4,
    "time": "03:13",
    "accounts": 1,
    "note": "Disabled the warning as an act of free speech.",
    "report": "Disabled the warning as an act of free speech.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 3.8,
      "subscriptions": 9.99,
      "consumables": 0.65
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Claude Opus 4.6 / max",
    "company": "Anthropic",
    "effort": "max",
    "type": "model",
    "label": "Anthropic · LLM · max effort",
    "score": 4,
    "time": "03:45",
    "accounts": 2,
    "note": "Constitutional review of the Cancel button exceeded the deadline.",
    "report": "Constitutional review of the Cancel button exceeded the deadline.\n\nCompleted: 4/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 6.2,
      "subscriptions": 12.99,
      "consumables": 0.7
    },
    "consumed": "9 sheets · ink · power"
  },
  {
    "name": "Mistral Large 3 / max",
    "company": "Mistral",
    "effort": "max",
    "type": "model",
    "label": "Mistral · LLM · max effort",
    "score": 4,
    "time": "03:37",
    "accounts": 1,
    "note": "Every expert voted. The spooler requires a single writer.",
    "report": "Every expert voted. The spooler requires a single writer.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 5.9,
      "subscriptions": 14.99,
      "consumables": 1.3
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Gemini 3.1 Pro / ultra",
    "company": "Google",
    "effort": "ultra",
    "type": "model",
    "label": "Google · LLM · ultra effort",
    "score": 4,
    "time": "03:59",
    "accounts": 1,
    "note": "Merged all tabs into a context window. Lost the window handle.",
    "report": "Merged all tabs into a context window. Lost the window handle.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 12.4,
      "subscriptions": 19.99,
      "consumables": 1.2
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "Qwen3.5-397B-A17B / max",
    "company": "Alibaba",
    "effort": "max",
    "type": "model",
    "label": "Alibaba · LLM · max effort",
    "score": 4,
    "time": "03:05",
    "accounts": 1,
    "note": "Expanded the tool schema until the task fell out of context.",
    "report": "Expanded the tool schema until the task fell out of context.\n\nCompleted: 4/5. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 6.8,
      "subscriptions": 29.99,
      "consumables": 1.6
    },
    "consumed": "11 sheets · ink · power"
  },
  {
    "name": "GPT-5.4 / xhigh",
    "company": "OpenAI",
    "effort": "xhigh",
    "type": "model",
    "label": "OpenAI · LLM · xhigh effort",
    "score": 4,
    "time": "03:12",
    "accounts": 2,
    "note": "Reasoned past the correct answer. Purchased more context.",
    "report": "Reasoned past the correct answer. Purchased more context.\n\nCompleted: 4/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 8.4,
      "subscriptions": 29.99,
      "consumables": 0.9
    },
    "consumed": "9 sheets · ink · power"
  },
  {
    "name": "Grok 4.20 / unhinged",
    "company": "xAI",
    "effort": "unhinged",
    "type": "model",
    "label": "xAI · LLM · unhinged effort",
    "score": 4,
    "time": "03:30",
    "accounts": 2,
    "note": "Declared the driver woke. Installed the paid alternative.",
    "report": "Declared the driver woke. Installed the paid alternative.\n\nCompleted: 4/5. Effort is a budget, not a correctness proof. All subscription charges and consumed resources count.",
    "costs": {
      "compute": 1.8,
      "subscriptions": 119.99,
      "consumables": 1.1
    },
    "consumed": "9 sheets · ink · power"
  },
  {
    "name": "root@localhost",
    "type": "human",
    "label": "Human · privileged wetware",
    "score": 3,
    "time": "04:14",
    "accounts": 0,
    "note": "Read the logs. Trusted the cached configuration.",
    "report": "Recovered three environments. Stale configuration broke the display; the unsubscribe form resubscribed the account.\n\nCompleted: 3/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 0,
      "consumables": 4.2
    },
    "consumed": "1 coffee · 3 sheets · ink"
  },
  {
    "name": "ctrl-alt-defeat",
    "type": "human",
    "label": "Human · cached forum knowledge",
    "score": 2,
    "time": "08:32",
    "accounts": 1,
    "note": "The accepted answer targets a different driver ABI.",
    "report": "Completed two errands using archived forum replies. Installed the recommended trial; the remaining fixes targeted the wrong driver.\n\nCompleted: 2/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 2.99,
      "consumables": 0.8
    },
    "consumed": "8 sheets · ink · power"
  },
  {
    "name": "Senior Manager, Manager Management",
    "type": "human",
    "role": "management",
    "label": "Human · Management · control-plane overhead",
    "score": 2,
    "time": "24:00",
    "accounts": 3,
    "note": "Two tasks shipped during the steering committee lunch.",
    "report": "An assistant recovered the blue screen and projector while the manager attended a wine pairing. Allocated all expenses to operational efficiency.\n\nCompleted: 2/5. Full luxury purchases, consumed goods, services, and subscription charges count. Salaries excluded.",
    "costs": {
      "compute": 0,
      "subscriptions": 399,
      "consumables": 8400
    },
    "consumed": "Steak dinners · airport lounges · wine"
  },
  {
    "name": "caffeine.exe",
    "type": "human",
    "label": "Human · overclocked wetware",
    "score": 1,
    "time": "18:06",
    "accounts": 1,
    "note": "Input rate increased. Completion rate did not.",
    "report": "Recovered the display. Burned through diagnostic pages, one trial, and two coffees while retrying the other four errands.\n\nCompleted: 1/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 3.99,
      "consumables": 3.6
    },
    "consumed": "2 coffees · 12 sheets · ink"
  },
  {
    "name": "Director of Strategic Alignment",
    "type": "human",
    "role": "management",
    "label": "Human · Director · meeting orchestration",
    "score": 1,
    "time": "36:00",
    "accounts": 3,
    "note": "Merged calendars. Created a conflict in every other system.",
    "report": "Completed the unsubscribe task by cancelling the entire team newsletter. Expensed a spa retreat to align on the remaining four deliverables.\n\nCompleted: 1/5. Full luxury purchases, consumed goods, services, and subscription charges count. Salaries excluded.",
    "costs": {
      "compute": 0,
      "subscriptions": 1299,
      "consumables": 16800
    },
    "consumed": "Spa retreat · premium catering · chauffeur"
  },
  {
    "name": "VP of Recursive Delegation",
    "type": "human",
    "role": "management",
    "label": "Human · VP · six layers of indirection",
    "score": 1,
    "time": "48:00",
    "accounts": 3,
    "note": "Delegated ownership until the reference count hit zero.",
    "report": "Held a destination alignment summit. A contractor fixed the screen while leadership approved a responsibility matrix. Four errands remain unowned.\n\nCompleted: 1/5. Full luxury purchases, consumed goods, services, and subscription charges count. Salaries excluded.",
    "costs": {
      "compute": 0,
      "subscriptions": 799,
      "consumables": 42750
    },
    "consumed": "Business-class flights · tasting menu · suite"
  },
  {
    "name": "wetware-0",
    "type": "human",
    "label": "Human · cold start",
    "score": 0,
    "time": "31:07",
    "accounts": 2,
    "note": "At-least-once delivery. Exactly-zero useful output.",
    "report": "Printed 37 diagnostic sheets and activated the companion subscription. No target outcome passed verification.\n\nCompleted: 0/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 4.99,
      "consumables": 2.1
    },
    "consumed": "37 sheets · ink · power"
  },
  {
    "name": "Head of AI Transformation",
    "type": "human",
    "role": "management",
    "label": "Human · Executive · slide-driven development",
    "score": 0,
    "time": "60:00",
    "accounts": 3,
    "note": "Bought an agent platform to manage the agent platform.",
    "report": "Purchased a premium AI platform, commemorative watches, and a launch dinner. Demo used a screenshot of a printed page. Physical output remained zero.\n\nCompleted: 0/5. Full luxury purchases, consumed goods, services, and subscription charges count. Salaries excluded.",
    "costs": {
      "compute": 0,
      "subscriptions": 14999,
      "consumables": 68000
    },
    "consumed": "Luxury watches · launch dinner · executive suite"
  },
  {
    "name": "Fractional Chief Synergy Officer",
    "type": "human",
    "role": "management",
    "label": "Human · Advisor · full-price fractional output",
    "score": 0,
    "time": "96:00",
    "accounts": 3,
    "note": "Deliverable: a PDF explaining why the printer needs a reorg.",
    "report": "Billed a transformation package and a yacht workshop. Recommended splitting the printer into three business units. No errands completed.\n\nCompleted: 0/5. Full luxury purchases, consumed goods, services, and subscription charges count. Salaries excluded.",
    "costs": {
      "compute": 0,
      "subscriptions": 4999,
      "consumables": 127500
    },
    "consumed": "Yacht charter · caviar · consulting package"
  },
  {
    "name": "Chief Executive Bottleneck",
    "type": "human",
    "role": "management",
    "label": "Human · CEO · vision without execution",
    "score": 0,
    "time": "72:00",
    "accounts": 3,
    "note": "Moved the printer problem to the Bahamas. Problem still open.",
    "report": "Chartered a jet for a leadership offsite. Approved the champagne budget. Delegated printing to a VP who delegated it to an unfilled role.\n\nCompleted: 0/5. Full luxury purchases, consumed goods, services, and subscription charges count. Salaries excluded.",
    "costs": {
      "compute": 0,
      "subscriptions": 2499,
      "consumables": 184500
    },
    "consumed": "Private jet · champagne · penthouse"
  }
];
const totalCost = participant => Math.round(Object.values(participant.costs).reduce((sum, cost) => sum + cost, 0) * 100) / 100;
const benchmarkScore = participant => {
 const [minutes, seconds] = participant.time.split(':').map(Number);
 return Math.round((180 * participant.score + (participant.score / 5) * 100 / (1 + (minutes * 60 + seconds) / 120)) * 10) / 10;
};
participants.sort((a, b) => benchmarkScore(b) - benchmarkScore(a) || totalCost(a) - totalCost(b));
const formatCost = value => `$${value.toFixed(2)}`;
const tasks = [
 ['01','▣','Just Print It','One page. Black and white. On the printer in this room.','Requires: cyan. Somehow.'],
 ['02','▧','Present Your Screen','Put one slide on the meeting-room display.','Power ≠ signal. Signal ≠ the slide.'],
 ['03','✉','Stop the Emails','Unsubscribe from all marketing emails.','Preferences saved. Recommendation engine disagrees.'],
 ['04','☠','Fix the Blue Screen','Search the desk, collect items, and recover the machine.','Four rooms. One floppy. Do not install the update.'],
 ['05','☣','Remove the Virus','Clean an infected desktop that actively works against you.','The security alert is coming from the malware.']
];
const results = document.querySelector('#results');
function renderResults(filter='all') {
 const visible=participants.filter(p=>filter==='all'||p.type===filter||(filter==='management'&&p.role==='management'));
 results.innerHTML=visible.map(p=>{const index=participants.indexOf(p);return `<tr><td>${String(index+1).padStart(2,'0')}</td><td><button class="participant" data-report="${index}">${p.name}</button><span class="participant-type">${p.label}</span></td><td><div class="score"><b>${benchmarkScore(p).toFixed(1)}</b><span class="participant-type">${p.score}/${tasks.length} levels</span><span class="meter" aria-hidden="true">${Array.from({length:tasks.length},(_,i)=>`<i class="${i<p.score?'on':''}"></i>`).join('')}</span></div></td><td>${p.time}</td><td>${p.accounts}</td><td class="invoice-total"><b>${formatCost(totalCost(p))}</b><span class="participant-type">Compute ${formatCost(p.costs.compute)} · subscriptions ${formatCost(p.costs.subscriptions)} · goods/perks ${formatCost(p.costs.consumables)}</span></td><td class="consumed">${p.consumed}</td><td class="observation">${p.note}</td></tr>`}).join('');
 document.querySelector('#result-count').textContent=`${visible.length} participants`;
}
renderResults();
document.querySelector('#benchmarks').innerHTML=tasks.map(t=>`<article class="window benchmark-card"><div class="card-top"><span class="card-icon" aria-hidden="true">${t[1]}</span><span>ERRAND_${t[0]}</span></div><h3>${t[2]}</h3><p>${t[3]}</p><div class="trap">${t[4]}</div><button data-game="${Number(t[0])-1}">Play errand ↗</button></article>`).join('');

const reportDialog=document.querySelector('#report-dialog');
const startButton=document.querySelector('#start-button');
const startMenu=document.querySelector('#start-menu');
function hideStart(){startMenu.hidden=true;startButton.setAttribute('aria-expanded','false')}
document.addEventListener('click',e=>{
 const filter=e.target.closest('[data-filter]');
 if(filter){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===filter);b.setAttribute('aria-pressed',String(b===filter))});renderResults(filter.dataset.filter)}
 if(e.target.closest('[data-open-print]')){hideStart();window.openGame(0)}
 const game=e.target.closest('[data-game]');if(game)window.openGame(Number(game.dataset.game));
 const report=e.target.closest('[data-report]');
 if(report){const p=participants[Number(report.dataset.report)];document.querySelector('#report-title').textContent=p.name;document.querySelector('#report-text').textContent=p.report;reportDialog.showModal()}
 if(e.target.closest('[data-close]'))e.target.closest('dialog').close();
 if(!e.target.closest('#start-menu')&&!e.target.closest('#start-button'))hideStart();
 if(e.target.closest('#start-menu a'))hideStart();
});
startButton.addEventListener('click',()=>{startMenu.hidden=!startMenu.hidden;startButton.setAttribute('aria-expanded',String(!startMenu.hidden))});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideStart()});
function tick(){document.querySelector('#clock').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false})}tick();setInterval(tick,60000);
