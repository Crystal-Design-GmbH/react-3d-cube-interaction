# Orbit Interaction component

A component to listen to and visualize rotation and zoom interaction.
You can mount click/touch listeners on any custom element.

Component positioning must be solved in user-land. Just wrap the component and position it yourself accordingly.

For an example how to use the component, have a look at `react-apps/app/src/index.tsx`

## Customizing

The component accepts a `classnames` object, where every aspect of the styling can be overriden and extended.

## Imperative API
You can access the imperative API by saving a reference of the component's API using the `ref` prop.

```typescript
interface CubeControlApi {
  rotateTo: (
    newRotation: (ControlElementRotation | ControlElementRotationInverted) & {
      /**
       * If true, animation is applied
       * to cube
       */
      smooth?: boolean;
    },
  ) => any;
}
```

## Notes

Make sure that your container element has the following CSS property:

```css
body {
  overscroll-behavior: contain;
}
```

This disables the default browser drag interactions (like drag to reload etc)
