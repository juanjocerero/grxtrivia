import tailwindcss from "@tailwindcss/postcss"

// Custom PostCSS plugin to remove `@layer` rules but keep the CSS inside
const removeLayerRules = (root) => {
  root.walkAtRules('layer', (rule) => {
    rule.replaceWith(rule.nodes);
  });
};

// Custom PostCSS plugin to remove `@property` rules
const removePropertyRules = (root) => {
  root.walkAtRules('property', (rule) => {
    rule.remove();
  });
};

// Custom PostCSS plugin to remove `@supports` rules (handle nested)
const removeSupportsRules = (root) => {
  let hasSupports = true;

  while (hasSupports) {
    hasSupports = false;

    root.walkAtRules('supports', (rule) => {
      hasSupports = true;
      rule.replaceWith(rule.nodes);
    });
  }
};

export default {
  plugins: [
    tailwindcss(),
    removeLayerRules,
    removePropertyRules,
    removeSupportsRules,
  ]
}
