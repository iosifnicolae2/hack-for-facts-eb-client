## Essential LLM Optimization for React + TanStack Router

### 1. **Add Meta Tags & JSON-LD to Routes**

```typescript
// routes/buget.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/buget')({
  validateSearch: (search: Record<string, unknown>) => ({
    year: Number(search.year) || 2024,
  }),
  
  head: ({ search }) => {
    const year = search.year
    
    return {
      meta: [
        { title: `Budget ${year} | Transparenta.eu` },
        { 
          name: 'description', 
          content: `Romanian budget data for ${year}. To view other years, add ?year=2023 to the URL. Available: 2010-2024.`
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Dataset',
            name: `Romanian Budget ${year}`,
            description: `Budget execution data for ${year}. Add ?year=YYYY to URL to view other years (2010-2024 available).`,
            url: `https://transparenta.eu/buget?year=${year}`,
            temporalCoverage: String(year),
            distribution: [{
              '@type': 'DataDownload',
              encodingFormat: 'CSV',
              contentUrl: `https://transparenta.eu/api/export?year=${year}&format=csv`
            }]
          })
        }
      ]
    }
  }
})
```

### 2. **Create llms.txt File**

```
// public/llms.txt
```

```markdown
# Transparenta.eu - Romanian Budget Data

## URL Parameters

- `?year=YYYY` - View specific year (2010-2024)
- Default: Current year (2024)

## Examples

- 2023 budget: https://transparenta.eu/buget?year=2023
- 2022 budget: https://transparenta.eu/buget?year=2022

## Data Export

- CSV: /api/export?year=YYYY&format=csv
- JSON: /api/export?year=YYYY&format=json
```

### 3. **Update robots.txt**

```txt
// public/robots.txt

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /

Sitemap: https://transparenta.eu/sitemap.xml
```

### 4. **Add Visible Instructions to Page**

```tsx
// In your budget page component
function BudgetPage() {
  const { year } = Route.useSearch()
  
  return (
    <div>
      <div className="bg-blue-50 p-4 rounded mb-6">
        <p>
          Showing data for <strong>{year}</strong>. 
          To view other years, add <code>?year=2023</code> to the URL.
        </p>
        <p className="text-sm mt-2">
          Available: 2010-2024
        </p>
      </div>
      
      {/* Your budget data display */}
    </div>
  )
}
```

### 5. **Enable HeadContent in Root**

```tsx
// routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { HeadContent, Scripts } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Scripts />
    </>
  )
})
```

***

**That's it!** These 5 steps cover:
- ✅ Structured data for AI understanding[1][2]
- ✅ llms.txt for AI crawler guidance[3][4]
- ✅ Clear URL parameter instructions[5][6]
- ✅ Proper crawling permissions[7][8]
- ✅ Human-readable usage guide[9][10]

The key: **Make URL parameter usage explicit everywhere** - in meta tags, structured data, llms.txt, and visible text.[11][12][13]

[1](https://www.npgroup.net/blog/role-of-schema-markup-in-ai-friendly-websites/)
[2](https://www.searchenginejournal.com/structured-datas-role-in-ai-and-ai-search-visibility/553175/)
[3](https://blog.dabrianmarketing.com/what-are-llms.txt-files-and-how-are-they-assisting-ai-crawlers)
[4](https://www.cension.ai/blog/llms-txt-robots-txt-differences/)
[5](https://seranking.com/blog/url-parameters/)
[6](https://dev.to/lingodotdev/how-to-serve-markdown-to-ai-agents-making-your-docs-more-ai-friendly-4pdn)
[7](https://genrank.io/blog/optimizing-your-robots-txt-for-generative-ai-crawlers/)
[8](https://www.qwairy.co/guides/complete-guide-to-robots-txt-and-llms-txt-for-ai-crawlers)
[9](https://www.madx.digital/learn/how-to-rank-in-chatgpt-search)
[10](https://www.tapclicks.com/blog/answer-engine-optimization)
[11](https://www.m8l.com/blog/llm-search-optimization-how-to-make-your-website-visible-to-ai)
[12](https://seoprofy.com/blog/llm-seo/)
[13](https://yoast.com/llm-seo-optimization-techniques-including-llms-txt/)