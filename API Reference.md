[API Reference](https://openrouter.ai/docs/api-reference/overview)

# API Reference

An overview of OpenRouter’s API

OpenRouter’s request and response schemas are very similar to the OpenAI Chat API, with a few small differences. At a high level, **OpenRouter normalizes the schema across models and providers** so you only need to learn one.

## Requests

### Request Format

Here is the request schema as a TypeScript type. This will be the body of your `POST` request to the `/api/v1/chat/completions` endpoint (see the [quick start](https://openrouter.ai/docs/quick-start) above for an example).

For a complete list of parameters, see the [Parameters](https://openrouter.ai/docs/api-reference/parameters).

Request Schema



```
1// Definitions of subtypes are below
2type Request = {
3  // Either "messages" or "prompt" is required
4  messages?: Message[];
5  prompt?: string;
6
7  // If "model" is unspecified, uses the user's default
8  model?: string; // See "Supported Models" section
9
10  // Allows to force the model to produce specific output format.
11  // See models page and note on this docs page for which models support it.
12  response_format?: { type: 'json_object' };
13
14  stop?: string | string[];
15  stream?: boolean; // Enable streaming
16
17  // See LLM Parameters (openrouter.ai/docs/api-reference/parameters)
18  max_tokens?: number; // Range: [1, context_length)
19  temperature?: number; // Range: [0, 2]
20
21  // Tool calling
22  // Will be passed down as-is for providers implementing OpenAI's interface.
23  // For providers with custom interfaces, we transform and map the properties.
24  // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.
25  // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools
26  tools?: Tool[];
27  tool_choice?: ToolChoice;
28
29  // Advanced optional parameters
30  seed?: number; // Integer only
31  top_p?: number; // Range: (0, 1]
32  top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
33  frequency_penalty?: number; // Range: [-2, 2]
34  presence_penalty?: number; // Range: [-2, 2]
35  repetition_penalty?: number; // Range: (0, 2]
36  logit_bias?: { [key: number]: number };
37  top_logprobs: number; // Integer only
38  min_p?: number; // Range: [0, 1]
39  top_a?: number; // Range: [0, 1]
40
41  // Reduce latency by providing the model with a predicted output
42  // https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs
43  prediction?: { type: 'content'; content: string };
44
45  // OpenRouter-only parameters
46  // See "Prompt Transforms" section: openrouter.ai/docs/transforms
47  transforms?: string[];
48  // See "Model Routing" section: openrouter.ai/docs/model-routing
49  models?: string[];
50  route?: 'fallback';
51  // See "Provider Routing" section: openrouter.ai/docs/provider-routing
52  provider?: ProviderPreferences;
53};
54
55// Subtypes:
56
57type TextContent = {
58  type: 'text';
59  text: string;
60};
61
62type ImageContentPart = {
63  type: 'image_url';
64  image_url: {
65    url: string; // URL or base64 encoded image data
66    detail?: string; // Optional, defaults to "auto"
67  };
68};
69
70type ContentPart = TextContent | ImageContentPart;
71
72type Message =
73  | {
74      role: 'user' | 'assistant' | 'system';
75      // ContentParts are only for the "user" role:
76      content: string | ContentPart[];
77      // If "name" is included, it will be prepended like this
78      // for non-OpenAI models: `{name}: {content}`
79      name?: string;
80    }
81  | {
82      role: 'tool';
83      content: string;
84      tool_call_id: string;
85      name?: string;
86    };
87
88type FunctionDescription = {
89  description?: string;
90  name: string;
91  parameters: object; // JSON Schema object
92};
93
94type Tool = {
95  type: 'function';
96  function: FunctionDescription;
97};
98
99type ToolChoice =
100  | 'none'
101  | 'auto'
102  | {
103      type: 'function';
104      function: {
105        name: string;
106      };
107    };
```

The `response_format` parameter ensures you receive a structured response from the LLM. The parameter is only supported by OpenAI models, Nitro models, and some others - check the providers on the model page on openrouter.ai/models to see if it’s supported, and set `require_parameters` to true in your Provider Preferences. See [Provider Routing](https://openrouter.ai/docs/features/provider-routing)

### Headers

OpenRouter allows you to specify some optional headers to identify your app and make it discoverable to users on our site.

- `HTTP-Referer`: Identifies your app on openrouter.ai
- `X-Title`: Sets/modifies your app’s title

TypeScript



```
1fetch('https://openrouter.ai/api/v1/chat/completions', {
2  method: 'POST',
3  headers: {
4    Authorization: 'Bearer <OPENROUTER_API_KEY>',
5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
7    'Content-Type': 'application/json',
8  },
9  body: JSON.stringify({
10    model: 'openai/gpt-4o',
11    messages: [
12      {
13        role: 'user',
14        content: 'What is the meaning of life?',
15      },
16    ],
17  }),
18});
```



##### Model routing

If the `model` parameter is omitted, the user or payer’s default is used. Otherwise, remember to select a value for `model` from the [supported models](https://openrouter.ai/models) or [API](https://openrouter.ai/api/v1/models), and include the organization prefix. OpenRouter will select the least expensive and best GPUs available to serve the request, and fall back to other providers or GPUs if it receives a 5xx response code or if you are rate-limited.



##### Streaming

[Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format) are supported as well, to enable streaming *for all models*. Simply send `stream: true` in your request body. The SSE stream will occasionally contain a “comment” payload, which you should ignore (noted below).



##### Non-standard parameters

If the chosen model doesn’t support a request parameter (such as `logit_bias` in non-OpenAI models, or `top_k` for OpenAI), then the parameter is ignored. The rest are forwarded to the underlying model API.

### Assistant Prefill

OpenRouter supports asking models to complete a partial response. This can be useful for guiding models to respond in a certain way.

To use this features, simply include a message with `role: "assistant"` at the end of your `messages` array.

TypeScript



```
1fetch('https://openrouter.ai/api/v1/chat/completions', {
2  method: 'POST',
3  headers: {
4    Authorization: 'Bearer <OPENROUTER_API_KEY>',
5    'Content-Type': 'application/json',
6  },
7  body: JSON.stringify({
8    model: 'openai/gpt-4o',
9    messages: [
10      { role: 'user', content: 'What is the meaning of life?' },
11      { role: 'assistant', content: "I'm not sure, but my best guess is" },
12    ],
13  }),
14});
```

### Images & Multimodal

Multimodal requests are only available via the `/api/v1/chat/completions` API with a multi-part `messages` parameter. The `image_url` can either be a URL or a data-base64 encoded image.

```
1"messages": [
2  {
3    "role": "user",
4    "content": [
5      {
6        "type": "text",
7        "text": "What's in this image?"
8      },
9      {
10        "type": "image_url",
11        "image_url": {
12          "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
13        }
14      }
15    ]
16  }
17]
```



Sample LLM response:

```
1{
2  "choices": [
3    {
4      "role": "assistant",
5      "content": "This image depicts a scenic natural landscape featuring a long wooden boardwalk that stretches out through an expansive field of green grass. The boardwalk provides a clear path and invites exploration through the lush environment. The scene is surrounded by a variety of shrubbery and trees in the background, indicating a diverse plant life in the area."
6    }
7  ]
8}
```



#### Uploading base64 encoded images

For locally stored images, you can send them to the model using base64 encoding. Here’s an example:

TypeScript



```
1import { readFile } from "fs/promises";
2
3const getFlowerImage = async (): Promise<string> => {
4  const imagePath = new URL("flower.jpg", import.meta.url);
5  const imageBuffer = await readFile(imagePath);
6  const base64Image = imageBuffer.toString("base64");
7  return `data:image/jpeg;base64,${base64Image}`;
8};
9
10...
11
12"messages": [
13  {
14    role: "user",
15    content: [
16      {
17        type: "text",
18        text: "What's in this image?",
19      },
20      {
21        type: "image_url",
22        image_url: {
23          url: `${await getFlowerImage()}`,
24        },
25      },
26    ],
27  },
28];
```

When sending data-base64 string, ensure it contains the content-type of the image. Example:

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII
```



Supported content types are:

- `image/png`
- `image/jpeg`
- `image/webp`

### Tool Calls

Tool calls (also known as function calling) allow you to give an LLM access to external tools. The LLM does not call the tools directly. Instead, it suggests the tool to call. The user then calls the tool separately and provides the results back to the LLM. Finally, the LLM formats the response into an answer to the user’s original question.

An example of the five-turn sequence:

1. The user asks a question, while supplying a list of available `tools` in a JSON schema format:

```
1...
2"messages": [{
3  "role": "user",
4  "content": "What is the weather like in Boston?"
5}],
6"tools": [{
7  "type": "function",
8  "function": {
9    "name": "get_current_weather",
10    "description": "Get the current weather in a given location",
11    "parameters": {
12      "type": "object",
13      "properties": {
14        "location": {
15          "type": "string",
16          "description": "The city and state, e.g. San Francisco, CA"
17        },
18        "unit": {
19          "type": "string",
20          "enum": [
21            "celsius",
22            "fahrenheit"
23          ]
24        }
25      },
26      "required": [
27        "location"
28      ]
29    }
30  }
31}]
```



1. The LLM responds with tool suggestion, together with appropriate arguments:

```
1// Some models might include their reasoning in content
2"message": {
3  "role": "assistant",
4  "content": null,
5  "tool_calls": [
6    {
7      "id": "call_9pw1qnYScqvGrCH58HWCvFH6",
8      "type": "function",
9      "function": {
10        "name": "get_current_weather",
11        "arguments": "{ \"location\": \"Boston, MA\"}"
12      }
13    }
14  ]
15},
```



1. The user calls the tool separately:

```
1const weather = await getWeather({ location: 'Boston, MA' });
2console.log(weather); // { "temperature": "22", "unit": "celsius", "description": "Sunny"}
```



1. The user provides the tool results back to the LLM:

```
1...
2"messages": [
3  {
4    "role": "user",
5    "content": "What is the weather like in Boston?"
6  },
7  {
8    "role": "assistant",
9    "content": null,
10    "tool_calls": [
11      {
12        "id": "call_9pw1qnYScqvGrCH58HWCvFH6",
13        "type": "function",
14        "function": {
15          "name": "get_current_weather",
16          "arguments": "{ \"location\": \"Boston, MA\"}"
17        }
18      }
19    ]
20  },
21  {
22    "role": "tool",
23    "name": "get_current_weather",
24    "tool_call_id": "call_9pw1qnYScqvGrCH58HWCvFH6",
25    "content": "{\"temperature\": \"22\", \"unit\": \"celsius\", \"description\": \"Sunny\"}"
26  }
27]
```



1. The LLM formats the tool result into a natural language response:

```
1...
2"message": {
3  "role": "assistant",
4  "content": "The current weather in Boston, MA is sunny with a temperature of 22°C."
5}
```



OpenRouter standardizes the tool calling interface. However, different providers and models may support less tool calling features and arguments. (ex: `tool_choice`, `tool_use`, `tool_result`)

## Responses

### Response Format

At a high level, OpenRouter normalizes the schema across models and providers to comply with the [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat).

This means that `choices` is always an array, even if the model only returns one completion. Each choice will contain a `delta` property if a stream was requested and a `message` property otherwise. This makes it easier to use the same code for all models.

Here’s the response schema as a TypeScript type:

TypeScript



```
1// Definitions of subtypes are below
2type Response = {
3  id: string;
4  // Depending on whether you set "stream" to "true" and
5  // whether you passed in "messages" or a "prompt", you
6  // will get a different output shape
7  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];
8  created: number; // Unix timestamp
9  model: string;
10  object: 'chat.completion' | 'chat.completion.chunk';
11
12  system_fingerprint?: string; // Only present if the provider supports it
13
14  // Usage data is always returned for non-streaming.
15  // When streaming, you will get one usage object at
16  // the end accompanied by an empty choices array.
17  usage?: ResponseUsage;
18};
1// If the provider returns usage, we pass it down
2// as-is. Otherwise, we count using the GPT-4 tokenizer.
3
4type ResponseUsage = {
5  /** Including images and tools if any */
6  prompt_tokens: number;
7  /** The tokens generated */
8  completion_tokens: number;
9  /** Sum of the above two fields */
10  total_tokens: number;
11};
```



```
1// Subtypes:
2type NonChatChoice = {
3  finish_reason: string | null;
4  text: string;
5  error?: ErrorResponse;
6};
7
8type NonStreamingChoice = {
9  finish_reason: string | null;
10  native_finish_reason: string | null;
11  message: {
12    content: string | null;
13    role: string;
14    tool_calls?: ToolCall[];
15  };
16  error?: ErrorResponse;
17};
18
19type StreamingChoice = {
20  finish_reason: string | null;
21  native_finish_reason: string | null;
22  delta: {
23    content: string | null;
24    role?: string;
25    tool_calls?: ToolCall[];
26  };
27  error?: ErrorResponse;
28};
29
30type ErrorResponse = {
31  code: number; // See "Error Handling" section
32  message: string;
33  metadata?: Record<string, unknown>; // Contains additional error information such as provider details, the raw error message, etc.
34};
35
36type ToolCall = {
37  id: string;
38  type: 'function';
39  function: FunctionCall;
40};
```



Here’s an example:

```
1{
2  "id": "gen-xxxxxxxxxxxxxx",
3  "choices": [
4    {
5      "finish_reason": "stop", // Normalized finish_reason
6      "native_finish_reason": "stop", // The raw finish_reason from the provider
7      "message": {
8        // will be "delta" if streaming
9        "role": "assistant",
10        "content": "Hello there!"
11      }
12    }
13  ],
14  "usage": {
15    "prompt_tokens": 0,
16    "completion_tokens": 4,
17    "total_tokens": 4
18  },
19  "model": "openai/gpt-3.5-turbo" // Could also be "anthropic/claude-2.1", etc, depending on the "model" that ends up being used
20}
```



### Finish Reason

OpenRouter normalizes each model’s `finish_reason` to one of the following values: `tool_calls`, `stop`, `length`, `content_filter`, `error`.

Some models and providers may have additional finish reasons. The raw finish_reason string returned by the model is available via the `native_finish_reason` property.

### Querying Cost and Stats

The token counts that are returned in the completions API response are **not** counted via the model’s native tokenizer. Instead it uses a normalized, model-agnostic count (accomplished via the GPT4o tokenizer). This is because some providers do not reliably return native token counts. This behavior is becoming more rare, however, and we may add native token counts to the response object in the future.

Credit usage and model pricing are based on the **native** token counts (not the ‘normalized’ token counts returned in the API response).

For precise token accounting using the model’s native tokenizer, you can retrieve the full generation information via the `/api/v1/generation` endpoint.

You can use the returned `id` to query for the generation stats (including token counts and cost) after the request is complete. This is how you can get the cost and tokens for *all models and requests*, streaming and non-streaming.

Query Generation Stats



```
1const generation = await fetch(
2  'https://openrouter.ai/api/v1/generation?id=$GENERATION_ID',
3  { headers },
4);
5
6const stats = await generation.json();
```

Example response



```
1{
2  "data": {
3    "id": "gen-nNPYi0ZB6GOK5TNCUMHJGgXo",
4    "model": "openai/gpt-4-32k",
5    "streamed": false,
6    "generation_time": 2,
7    "tokens_prompt": 24,
8    "tokens_completion": 29,
9    "total_cost": 0.00492
10    // ... additional stats
11  }
12}
```

Note that token counts are also available in the `usage` field of the response body for non-streaming completions.

Was this page helpful?YesNo

On this page

- [Additional Information](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#additional-information)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

# Streaming

The OpenRouter API allows streaming responses from *any model*. This is useful for building chat interfaces or other applications where the UI should update as the model generates the response.

To enable streaming, you can set the `stream` parameter to `true` in your request. The model will then stream the response to the client in chunks, rather than returning the entire response at once.

Here is an example of how to stream a response, and process it:

PythonTypeScript



```
1import requests
2import json
3
4question = "How would you build the tallest building ever?"
5
6url = "https://openrouter.ai/api/v1/chat/completions"
7headers = {
8  "Authorization": f"Bearer {API_TOKEN}",
9  "Content-Type": "application/json"
10}
11
12payload = {
13  "model": "openai/gpt-4o",
14  "messages": [{"role": "user", "content": question}],
15  "stream": True
16}
17
18buffer = ""
19with requests.post(url, headers=headers, json=payload, stream=True) as r:
20  for chunk in r.iter_content(chunk_size=1024, decode_unicode=True):
21    buffer += chunk
22    while True:
23      try:
24        # Find the next complete SSE line
25        line_end = buffer.find('\n')
26        if line_end == -1:
27          break
28
29        line = buffer[:line_end].strip()
30        buffer = buffer[line_end + 1:]
31
32        if line.startswith('data: '):
33          data = line[6:]
34          if data == '[DONE]':
35            break
36
37          try:
38            data_obj = json.loads(data)
39            content = data_obj["choices"][0]["delta"].get("content")
40            if content:
41              print(content, end="", flush=True)
42          except json.JSONDecodeError:
43            pass
44      except Exception:
45        break
```

### Additional Information

For SSE (Server-Sent Events) streams, OpenRouter occasionally sends comments to prevent connection timeouts. These comments look like:

```
: OPENROUTER PROCESSING
```



Comment payload can be safely ignored per the [SSE specs](https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation). However, you can leverage it to improve UX as needed, e.g. by showing a dynamic loading indicator.

Some SSE client implementations might not parse the payload according to spec, which leads to an uncaught error when you `JSON.stringify` the non-JSON payloads. We recommend the following clients:

- [eventsource-parser](https://github.com/rexxars/eventsource-parser)
- [OpenAI SDK](https://www.npmjs.com/package/openai)
- [Vercel AI SDK](https://www.npmjs.com/package/ai)

Was this page helpful?YesNo

On this page

- [Using an API key](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#using-an-api-key)
- [If your key has been exposed](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#if-your-key-has-been-exposed)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

# Authentication

API Authentication

You can cover model costs with OpenRouter API keys.

Our API authenticates requests using Bearer tokens. This allows you to use `curl` or the [OpenAI SDK](https://platform.openai.com/docs/frameworks) directly with OpenRouter.



##### 

API keys on OpenRouter are more powerful than keys used directly for model APIs.

They allow users to set credit limits for apps, and they can be used in [OAuth](https://openrouter.ai/docs/use-cases/oauth-pkce) flows.

## Using an API key

To use an API key, [first create your key](https://openrouter.ai/keys). Give it a name and you can optionally set a credit limit.

If you’re calling the OpenRouter API directly, set the `Authorization` header to a Bearer token with your API key.

If you’re using the OpenAI Typescript SDK, set the `api_base` to `https://openrouter.ai/api/v1` and the `apiKey` to your API key.

TypeScript (Bearer Token)TypeScript (OpenAI SDK)PythonShell



```
1import openai
2
3openai.api_base = "https://openrouter.ai/api/v1"
4openai.api_key = "<OPENROUTER_API_KEY>"
5
6response = openai.ChatCompletion.create(
7  model="openai/gpt-4o",
8  messages=[...],
9  headers={
10    "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
11    "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
12  },
13)
14
15reply = response.choices[0].message
```

To stream with Python, [see this example from OpenAI](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_stream_completions.ipynb).

## If your key has been exposed



##### 

You must protect your API keys and never commit them to public repositories.

OpenRouter is a GitHub secret scanning partner, and has other methods to detect exposed keys. If we determine that your key has been compromised, you will receive an email notification.

If you receive such a notification or suspect your key has been exposed, immediately visit [your key settings page](https://openrouter.ai/settings/keys) to delete the compromised key and create a new one.

Using environment variables and keeping keys out of your codebase is strongly recommended.

Was this page helpful?YesNo

On this page

- [Temperature](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#temperature)
- [Top P](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#top-p)
- [Top K](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#top-k)
- [Frequency Penalty](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#frequency-penalty)
- [Presence Penalty](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#presence-penalty)
- [Repetition Penalty](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#repetition-penalty)
- [Min P](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#min-p)
- [Top A](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#top-a)
- [Seed](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#seed)
- [Max Tokens](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#max-tokens)
- [Logit Bias](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#logit-bias)
- [Logprobs](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#logprobs)
- [Top Logprobs](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#top-logprobs)
- [Response Format](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#response-format)
- [Structured Outputs](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#structured-outputs)
- [Stop](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#stop)
- [Tools](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#tools)
- [Tool Choice](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#tool-choice)
- [Include Reasoning](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#include-reasoning)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

# Parameters

Sampling parameters shape the token generation process of the model. You may send any parameters from the following list, as well as others, to OpenRouter.

OpenRouter will default to the values listed below if certain parameters are absent from your request (for example, `temperature` to 1.0). We will also transmit some provider-specific parameters, such as `safe_prompt` for Mistral or `raw_mode` for Hyperbolic directly to the respective providers if specified.

Please refer to the model’s provider section to confirm which parameters are supported. For detailed guidance on managing provider-specific parameters, [click here](https://openrouter.ai/docs/features/provider-routing#requiring-providers-to-support-all-parameters-beta).

## Temperature

- Key: `temperature`
- Optional, **float**, 0.0 to 2.0
- Default: 1.0
- Explainer Video: [Watch](https://youtu.be/ezgqHnWvua8)

This setting influences the variety in the model’s responses. Lower values lead to more predictable and typical responses, while higher values encourage more diverse and less common responses. At 0, the model always gives the same response for a given input.

## Top P

- Key: `top_p`
- Optional, **float**, 0.0 to 1.0
- Default: 1.0
- Explainer Video: [Watch](https://youtu.be/wQP-im_HInk)

This setting limits the model’s choices to a percentage of likely tokens: only the top tokens whose probabilities add up to P. A lower value makes the model’s responses more predictable, while the default setting allows for a full range of token choices. Think of it like a dynamic Top-K.

## Top K

- Key: `top_k`
- Optional, **integer**, 0 or above
- Default: 0
- Explainer Video: [Watch](https://youtu.be/EbZv6-N8Xlk)

This limits the model’s choice of tokens at each step, making it choose from a smaller set. A value of 1 means the model will always pick the most likely next token, leading to predictable results. By default this setting is disabled, making the model to consider all choices.

## Frequency Penalty

- Key: `frequency_penalty`
- Optional, **float**, -2.0 to 2.0
- Default: 0.0
- Explainer Video: [Watch](https://youtu.be/p4gl6fqI0_w)

This setting aims to control the repetition of tokens based on how often they appear in the input. It tries to use less frequently those tokens that appear more in the input, proportional to how frequently they occur. Token penalty scales with the number of occurrences. Negative values will encourage token reuse.

## Presence Penalty

- Key: `presence_penalty`
- Optional, **float**, -2.0 to 2.0
- Default: 0.0
- Explainer Video: [Watch](https://youtu.be/MwHG5HL-P74)

Adjusts how often the model repeats specific tokens already used in the input. Higher values make such repetition less likely, while negative values do the opposite. Token penalty does not scale with the number of occurrences. Negative values will encourage token reuse.

## Repetition Penalty

- Key: `repetition_penalty`
- Optional, **float**, 0.0 to 2.0
- Default: 1.0
- Explainer Video: [Watch](https://youtu.be/LHjGAnLm3DM)

Helps to reduce the repetition of tokens from the input. A higher value makes the model less likely to repeat tokens, but too high a value can make the output less coherent (often with run-on sentences that lack small words). Token penalty scales based on original token’s probability.

## Min P

- Key: `min_p`
- Optional, **float**, 0.0 to 1.0
- Default: 0.0

Represents the minimum probability for a token to be considered, relative to the probability of the most likely token. (The value changes depending on the confidence level of the most probable token.) If your Min-P is set to 0.1, that means it will only allow for tokens that are at least 1/10th as probable as the best possible option.

## Top A

- Key: `top_a`
- Optional, **float**, 0.0 to 1.0
- Default: 0.0

Consider only the top tokens with “sufficiently high” probabilities based on the probability of the most likely token. Think of it like a dynamic Top-P. A lower Top-A value focuses the choices based on the highest probability token but with a narrower scope. A higher Top-A value does not necessarily affect the creativity of the output, but rather refines the filtering process based on the maximum probability.

## Seed

- Key: `seed`
- Optional, **integer**

If specified, the inferencing will sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed for some models.

## Max Tokens

- Key: `max_tokens`
- Optional, **integer**, 1 or above

This sets the upper limit for the number of tokens the model can generate in response. It won’t produce more than this limit. The maximum value is the context length minus the prompt length.

## Logit Bias

- Key: `logit_bias`
- Optional, **map**

Accepts a JSON object that maps tokens (specified by their token ID in the tokenizer) to an associated bias value from -100 to 100. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token.

## Logprobs

- Key: `logprobs`
- Optional, **boolean**

Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned.

## Top Logprobs

- Key: `top_logprobs`
- Optional, **integer**

An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.

## Response Format

- Key: `response_format`
- Optional, **map**

Forces the model to produce specific output format. Setting to `{ "type": "json_object" }` enables JSON mode, which guarantees the message the model generates is valid JSON.

**Note**: when using JSON mode, you should also instruct the model to produce JSON yourself via a system or user message.

## Structured Outputs

- Key: `structured_outputs`
- Optional, **boolean**

If the model can return structured outputs using response_format json_schema.

## Stop

- Key: `stop`
- Optional, **array**

Stop generation immediately if the model encounter any token specified in the stop array.

## Tools

- Key: `tools`
- Optional, **array**

Tool calling parameter, following OpenAI’s tool calling request shape. For non-OpenAI providers, it will be transformed accordingly. [Click here to learn more about tool calling](https://openrouter.ai/docs/requests#tool-calls)

## Tool Choice

- Key: `tool_choice`
- Optional, **array**

Controls which (if any) tool is called by the model. ‘none’ means the model will not call any tool and instead generates a message. ‘auto’ means the model can pick between generating a message or calling one or more tools. ‘required’ means the model must call one or more tools. Specifying a particular tool via `{"type": "function", "function": {"name": "my_function"}}` forces the model to call that tool.

## Include Reasoning

- Key: `include_reasoning`
- Optional, **boolean**
- Default: **false**

If the endpoint can return reasoning explicitly, setting this parameter will include reasoning tokensin the response. They will be available as text in a field called `reasoning`, within a message or message delta, alongside an empty `content` field.

Was this page helpful?YesNo

On this page

- [Rate Limits and Credits Remaining](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#rate-limits-and-credits-remaining)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

# Limits

Rate Limits



##### 

If you need a lot of inference, making additional accounts or API keys *makes no difference*. We manage the rate limit globally. We do however have different rate limits for different models, so you can share the load that way if you do run into issues. If you start getting rate limited — [tell us](https://discord.gg/fVyRaUDgxW)! We are here to help. If you are able, don’t specify providers; that will let us load balance it better.

## Rate Limits and Credits Remaining

To check the rate limit or credits left on an API key, make a GET request to `https://openrouter.ai/api/v1/auth/key`.

TypeScript



```
1const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
2  method: 'GET',
3  headers: {
4    Authorization: 'Bearer <OPENROUTER_API_KEY>',
5  },
6});
```

If you submit a valid API key, you should get a response of the form:

TypeScript



```
1type Key = {
2  data: {
3    label: string;
4    usage: number; // Number of credits used
5    limit: number | null; // Credit limit for the key, or null if unlimited
6    is_free_tier: boolean; // Whether the user has paid for credits before
7    rate_limit: {
8      requests: number; // Number of requests allowed...
9      interval: string; // in this interval, e.g. "10s"
10    };
11  };
12};
```

There are a few rate limits that apply to certain types of requests, regardless of account status:

1. **Free limit**: If you are using a free model variant (with an ID ending in `:free`), then you will be limited to 20 requests per minute and 200 requests per day.
2. **DDoS protection**: Cloudflare’s DDoS protection will block requests that dramatically exceed reasonable usage.

For all other requests, rate limits are a function of the number of credits remaining on the key or account. Partial credits round up in your favor. For the credits available on your API key, you can make **1 request per credit per second** up to the surge limit (typically 500 requests per second, but you can go higher).

For example:

- 0.5 credits → 1 req/s (minimum)
- 5 credits → 5 req/s
- 10 credits → 10 req/s
- 500 credits → 500 req/s
- 1000 credits → Contact us if you see ratelimiting from OpenRouter

If your account has a negative credit balance, you may see `402` errors, including for free models. Adding credits to put your balance above zero allows you to use those models again.

Was this page helpful?YesNo

On this page

- [Error Codes](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#error-codes)
- [Moderation Errors](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#moderation-errors)
- [Provider Errors](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#provider-errors)
- [When No Content is Generated](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge#when-no-content-is-generated)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

# Errors

API Errors

For errors, OpenRouter returns a JSON response with the following shape:

```
1type ErrorResponse = {
2  error: {
3    code: number;
4    message: string;
5    metadata?: Record<string, unknown>;
6  };
7};
```



The HTTP Response will have the same status code as `error.code`, forming a request error if:

- Your original request is invalid
- Your API key/account is out of credits

Otherwise, the returned HTTP response status will be `200` and any error occurred while the LLM is producing the output will be emitted in the response body or as an SSE data event.

Example code for printing errors in JavaScript:

```
1const request = await fetch('https://openrouter.ai/...');
2console.log(request.status); // Will be an error code unless the model started processing your request
3const response = await request.json();
4console.error(response.error?.status); // Will be an error code
5console.error(response.error?.message);
```



## Error Codes

- **400**: Bad Request (invalid or missing params, CORS)
- **401**: Invalid credentials (OAuth session expired, disabled/invalid API key)
- **402**: Your account or API key has insufficient credits. Add more credits and retry the request.
- **403**: Your chosen model requires moderation and your input was flagged
- **408**: Your request timed out
- **429**: You are being rate limited
- **502**: Your chosen model is down or we received an invalid response from it
- **503**: There is no available model provider that meets your routing requirements

## Moderation Errors

If your input was flagged, the `error.metadata` will contain information about the issue. The shape of the metadata is as follows:

```
1type ModerationErrorMetadata = {
2  reasons: string[]; // Why your input was flagged
3  flagged_input: string; // The text segment that was flagged, limited to 100 characters. If the flagged input is longer than 100 characters, it will be truncated in the middle and replaced with ...
4  provider_name: string; // The name of the provider that requested moderation
5  model_slug: string;
6};
```



## Provider Errors

If the model provider encounters an error, the `error.metadata` will contain information about the issue. The shape of the metadata is as follows:

```
1type ProviderErrorMetadata = {
2  provider_name: string; // The name of the provider that encountered the error
3  raw: unknown; // The raw error from the provider
4};
```



## When No Content is Generated

Occasionally, the model may not generate any content. This typically occurs when:

- The model is warming up from a cold start
- The system is scaling up to handle more requests

Warm-up times usually range from a few seconds to a few minutes, depending on the model and provider.

If you encounter persistent no-content issues, consider implementing a simple retry mechanism or trying again with a different provider or model that has more recent activity.

Additionally, be aware that in some cases, you may still be charged for the prompt processing cost by the upstream provider, even if no content is generated.

Was this page helpful?YesNo

[API Reference](https://openrouter.ai/docs/api-reference/overview)

Completion

**POST**

https://openrouter.ai/api/v1/completions

Send a completion request to a selected model (text-only format)

### Request

This endpoint expects an object.

modelstringRequired

The model ID to use

promptstringRequired

The text prompt to complete

streambooleanOptionalDefaults to `false`

### Response

Successful completion

idstringOptional

choiceslist of objectsOptional

Show 3 properties



[API Reference](https://openrouter.ai/docs/api-reference/overview)

Chat completion

**POST**

https://openrouter.ai/api/v1/chat/completions

Send a chat completion request to a selected model

### Request

This endpoint expects an object.

modelstringRequired

The model ID to use

messageslist of objectsRequired

Show 2 properties

streambooleanOptionalDefaults to `false`

### Response

Successful completion

idstringOptional

choiceslist of objectsOptional

Show property



[API Reference](https://openrouter.ai/docs/api-reference/overview)

Get a generation

**GET**

https://openrouter.ai/api/v1/generation

Returns metadata about a specific generation request

### Query parameters

idstringRequired

### Response

Returns the request metadata for this generation

dataobject

Show 26 properties



[API Reference](https://openrouter.ai/docs/api-reference/overview)

List available models

**GET**

https://openrouter.ai/api/v1/models

Returns a list of models available through the API

### Response

List of available models

datalist of objects

Show 4 properties



[API Reference](https://openrouter.ai/docs/api-reference/overview)

List endpoints for a model

**GET**

https://openrouter.ai/api/v1/models/:author/:slug/endpoints

### Path parameters

authorstringRequired

slugstringRequired

### Response

List of endpoints for the model

dataobject

Show 6 properties

**GET**

/api/v1/models/:author/:slug/endpoints



```
$curl https://openrouter.ai/api/v1/models/author/slug/endpoints
```

200Retrieved



```
1{
2  "data": {
3    "id": "id",
4    "name": "name",
5    "created": 1.1,
6    "description": "description",
7    "architecture": {
8      "tokenizer": "tokenizer",
9      "instruct_type": "instruct_type",
10      "modality": "modality"
11    },
12    "endpoints": [
13      {
14        "name": "name",
15        "context_length": 1.1,
16        "pricing": {
17          "request": "request",
18          "image": "image",
19          "prompt": "prompt",
20          "completion": "completion"
21        },
22        "provider_name": "provider_name",
23        "supported_parameters": [
24          "supported_parameters"
25        ]
26      }
27    ]
28  }
29}
```

[API Reference](https://openrouter.ai/docs/api-reference/overview)

Get credits

**GET**

https://openrouter.ai/api/v1/credits

Returns the total credits purchased and used for the authenticated user

### Response

Returns the total credits purchased and used

dataobject

Show 2 properties

**GET**

/api/v1/credits



```
$curl https://openrouter.ai/api/v1/credits \
>     -H "Authorization: Bearer <token>"
```

200Retrieved



```
1{
2  "data": {
3    "total_credits": 1.1,
4    "total_usage": 1.1
5  }
6}
```

[API Reference](https://openrouter.ai/docs/api-reference/overview)

Create a Coinbase charge

**POST**

https://openrouter.ai/api/v1/credits/coinbase

Creates and hydrates a Coinbase Commerce charge for cryptocurrency payments

### Request

This endpoint expects an object.

amountdoubleRequired

USD amount to charge (must be between min and max purchase limits)

senderstringRequired

Ethereum address of the sender

chain_idintegerRequired

Chain ID for the transaction

### Response

Returns the calldata to fulfill the transaction