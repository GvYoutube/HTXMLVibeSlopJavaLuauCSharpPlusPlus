# HTXMLVibeSlopJavaLuauC#++

(Please note: every thing here is vibecoded, but this is intentional. This is where the Vibe in HTXMLVibeSlopJavaLuauC#++ comes from.)

> A language designed by committee, compiled by vibes, and debugged by an AI-powered rice cooker.

HTXMLVibeSlopJavaLuauC#++ (file extension: `.hxvsjlcspp`) is a tiny, intentionally ridiculous programming language with XML-ish tags, Java-ish declarations, Luau-ish locals, C#-ish directives, and C++-ish punctuation. It is a joke language, not a real implementation of those languages.

Motto: “It compiles on my machine, probably.”

## Try it

Open the website in a browser and use the in-page playground. The playground runs a deliberately small, safe subset locally; it does not execute JavaScript from your program.

To run the site locally, open `index.html` in a browser. No build step or dependencies are required.

## A tiny sample

```xml
<!doctype htxmlvsjlcspp>
<slop>
  <local name="who" type="String" value="world" />
  <fn name="greet" params="person">
    <say>Hello, {person}!</say>
  </fn>
  <call name="greet" args="who" />
</slop>
```

Statements live in tags, functions contain tags, and tags are allowed to call functions. The runtime currently supports `<local>`, `<fn>`, `<call>`, `<say>`, `<if>`, and `<repeat>`. Variables interpolate with `{name}`. `<if test="left == right">` supports equality checks; `<repeat times="N">` repeats a block and provides `{i}` (starting at 1). Unsupported tags and invalid programs produce helpful-ish errors instead of being evaluated as HTML.

## Language rules (subject to compiler mood)

- The document starts with `<!doctype htxmlvsjlcspp>` and has a `<slop>` root.
- Tags and attributes use XML syntax; close your tags or the parser will judge you.
- Values are strings. Types such as `String` are decorative and emotionally supportive.
- Errors are suggestions, not failures. This tiny playground, regrettably, does stop on errors.
- In the imaginary full language, Tuesdays swap `true` and `false`; the playground does not implement that bug-feature.
- Pointers require an AI-renamed variable, but pointers are not implemented. Please file a complaint with the rice cooker.

## Project files

- `index.html`, `site.css`: the website and its short playground.
- `playground.js`: browser-only interpreter for the safe subset.
- `examples/website.hxvsjlcspp`: a longer standalone sample program.
- `.github/workflows/pages.yml`: deploys the static site to GitHub Pages when enabled.

## Publish with GitHub Pages

In the repository settings, set Pages → Build and deployment → Source to GitHub Actions. The workflow deploys the static site from the default branch on pushes. GitHub Pages may take a little while to publish the first deployment.
