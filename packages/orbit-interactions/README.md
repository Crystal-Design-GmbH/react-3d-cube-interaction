# Orbit Interaction component

- Mount click/touch listeners on any custom element
- Component positioning must be solved in user-land. Just wrap the component and position it yourself accordingly (example is under `react-apps/app`).
- Make sure that your container element has the following CSS property:

```css
body {
  overscroll-behavior: contain;
}
```

This disabled the default browser drag interactions (like drag to reload etc)

## TODO

- Custom CSS classes
- Initial rot,zoom
