There is a huge detail on the initial page load on dev. That delay was introduced with the ssr migration. Investigate the problem.

---

Please write a research prompt with reference to our files to investigate how to solve the ssr problems and other related problems specific to each library.

The output should be a multi section markdown file with the following sections:

- Introduction
- Problem Description
- Code references

The goal of your preliminary research is to identify key problems on our codebase related to tankstack start migration and other libraries that need ssr and start another deep research using chatgpt research and the web.

---

Next steps I recommend (based on the research) if you want me to proceed:

  1. Move heavy data work out of beforeLoad into loader (entities/map/analytics) and decide which queries should block SSR vs stream.

I suggest starting with the entities route.
SSR: query GetEntityDetails -> fast and provide entity details for the initial page load.
