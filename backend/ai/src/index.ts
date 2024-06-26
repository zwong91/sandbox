export interface Env {
	AI: any
}

export default {
	async fetch(request, env, ctx: ExecutionContext): Promise<Response> {
		if (request.method !== "GET") {
			return new Response("Method Not Allowed", { status: 405 })
		}

		const url = new URL(request.url)
		const fileName = url.searchParams.get("fileName")
		const instructions = url.searchParams.get("instructions")
		const line = url.searchParams.get("line")
		const code = url.searchParams.get("code")

		const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
			messages: [
				{
					role: "system",
					content:
						"You are an expert coding assistant. You read code from a file, and you suggest new code to add to the file. You may be given instructions on what to generate, which you should follow. You should generate code that is CORRECT, efficient, and follows best practices. You may generate multiple lines of code if necessary. When you generate code, you should ONLY return the code, and nothing else. You MUST NOT include backticks in the code you generate.",
				},
				{
					role: "user",
					content: `The file is called ${fileName}.`,
				},
				{
					role: "user",
					content: `Here are my instructions on what to generate: ${instructions}.`,
				},
				{
					role: "user",
					content: `Suggest me code to insert at line ${line} in my file. Give only the code, and NOTHING else. DO NOT include backticks in your response. My code file content is as follows

${code}`,
				},
			],
		},
		{
			gateway: {
			  id: "workers",
			  skipCache: false,
			  cacheTtl: 3360
			}
		})

		return new Response(JSON.stringify(response))
	},
} satisfies ExportedHandler<Env>
