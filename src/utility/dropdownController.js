let providerHandle;

export const registerCustomCompletions = (monaco, results = []) => {
  console.log(results)
  if (providerHandle) providerHandle.dispose(); // clear previous

  providerHandle = monaco.languages.registerCompletionItemProvider('plaintext', {
    provideCompletionItems: () => {
      return {
        suggestions: results.map((item) => ({
          label: item.label,
          kind: monaco.languages.CompletionItemKind.Text,
          insertText: item.label,
        })),
      };
    },
  });
};
