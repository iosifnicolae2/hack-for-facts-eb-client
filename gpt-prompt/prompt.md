Now, I want you to create a script that extracts the link from the ## Research URL section of the markdown file, uses this link to call the research extraction web flow script, and then add a new section ## Processes with the timestamp, link to the output file. We should use it as flag to skip the research extraction if the section already exists. The output should be stored in the economic folder using the code convention to open the link. Have a look at how the functional files codes are done. Please use the normal code, don't include the buget sector code, but the original code form the economic classification file. 

To get the output file, you can use the following command:

echo "https://claude.ai/chat/1d26d57d-4b44-425a-95f5-04a7dd2f2e8f" |  web-flow research-extraction --raw > 10.md

Use the correct path. For example, for code 10.md, the path should be:

"https://claude.ai/chat/1d26d57d-4b44-425a-95f5-04a7dd2f2e8f" |  web-flow research-extraction --raw > "./public/assets/text/ro/economic/10.md"