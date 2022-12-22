import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
// TODO: Add `deps.ts`

const BASE_URL = "https://www.jenkins.io/";
const URL = BASE_URL + "artwork";
const PORT = parseInt(Deno.env.get("PORT") ?? "8088")

const handler = async (request: Request): Response => {
  // Fetch and save HTML content
  const raw_res = await fetch(URL);
  const html = await raw_res.text();
  const html_dom = new DOMParser().parseFromString(html, "text/html");
  const image_nodes = html_dom?.querySelectorAll(".logo-thumb");

  // Extract src attributes from html nodes, keeping just the endpoint
  const images_urls: string[] = [];
  Array.from(image_nodes).forEach((image_node) => {
    images_urls.push(image_node.attributes.getNamedItem("src").value);
  });
  const filtered_urls = pop_denied_elements(images_urls, [
    "cossack",
    // "worldwide",
  ]); // TODO: Read the deny_list from repo or some remote location
  // Generate a random element from the filtered list
  const index_to_return = Math.floor(Math.random() * filtered_urls.length);
  const Jenkins_art_URL = BASE_URL + filtered_urls[index_to_return];

  console.log(`Fetching ${Jenkins_art_URL}`);

  // Fetch the remote image --> Not needed anymore as we redirect the request
  const headers = new Headers();
  headers.set('content-type', 'image/png')
  const Jenkins_art_png = new Uint8Array(await (await fetch(Jenkins_art_URL)).arrayBuffer());
  return new Response(
    Jenkins_art_png,
    {
      status: 200,
      headers: headers,
    }
  )
};

console.log("HTTP server running. Access it at localhost: " + PORT);
await serve(handler, { port:PORT });


function pop_denied_elements(arr: string[], deny_list: string[]) {
  return arr.filter((element) => {
    for (const deny_element of deny_list) {
      if (element.includes(deny_element)) {
        return false;
      }
    }
    return true;
  });
}
