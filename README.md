![](https://cdn-images-1.medium.com/max/1600/1*Gm7A7w4vJZeNXKHJQxhq7Q.gif)

# maslo-persona-2d
Want to add a cute and adorable personified entity to your AI project? YOU HAVE COME TO THE RIGHT PLACE! From the makers of the highly popular toy BB-8 comes Maslo... an animated expressive empathetic entity. Use Maslo on a website, mobile phone, or anywhere you'd like.

## Persona Module
You can think of the persona as the companion's ‘face’. This is a mathematically expressed amorphous shape. This shape consists of multiple properties (ie: size, speed, brightness, complexity, color, etc) that change based on user inputs and interaction. Every user can have a unique persona and their persona will evolve over time.

## Persona Reactions
Each persona will react to the user inputs through animations that include visual changes, sound, color, and haptic feedback. You can play with the reactions here: (https://heymaslo.github.io/maslo-persona-2d/)
The types of reactions described below:
* State Reaction: A reaction is a particular audiovisual response from the persona.
* Dynamic Idle: An anthropomorphised animation based on average of computed sentiment.

## Install & Run

1. Install Node.js & NPM ( * If not installed )
2. Run in project root:

```bash
yarn
yarn dev
```

3. Browse to localhost:8080 ~~(google chrome only for now)~~

## Structure

1. `lib` – here lives ES6 classes with meaningful JSDoc comments for Maslo Persona core code. Not ready for rendering, requires further integration to a rendering scene, but all core logic is placed here including usage of Three.js, gsap, mobx.
2. `web` – a DOM/WebGL renderer for Maslo Persona that is ready to be placed right in HTML project with minimal additional configuration.
3. `webdemo` – basically the only runnable (and main for now) guy here, single page site based on webpack dev server that uses `web` package for Persona rendering.
4. TODO:  `react-native` – renderer for RN

## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.
