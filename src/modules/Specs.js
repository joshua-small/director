import { tools, evalExpression } from "./helpers.js";

export const actionTypes = [
  {
    id: 'toggle',
    label: 'Toggle visibility',
    group: 'Common',
    execute: (object, action) => tools.toggle(object?.document || object),
  },
  {
    id: 'hide',
    label: 'Hide',
    group: 'Common',
    execute: (object, action) => tools.hide(object?.document || object),
  },
  {
    id: 'show',
    label: 'Show',
    group: 'Common',
    execute: (object, action) => tools.show(object?.document || object),
  },
  {
    id: 'kill',
    label: 'Kill',
    group: 'Tokens',
    execute: (object, action) => tools.kill(object?.document || object),
  },
  {
    id: 'revive',
    label: 'Revive',
    group: 'Tokens',
    execute: (object, action) => tools.revive(object?.document || object),
  },
  {
    id: 'playSequence',
    label: 'Play sequence',
    group: 'Sequences',

    execute: (object, action, event, seqVars) => {
      const overrides = seqVars || {};
      overrides[action.args[1]?.name || action.args[1]] = object;
      globalThis.Director.playSequence(action.args[0], overrides);
    },
    args: [{ type: "sequence", label: "sequence" }, { type: "sequence-vars", label: "var" }]
  },
  {
    id: 'endEffect',
    label: 'End Effects',
    group: 'Sequences',
    valueType: 'effectSource',
    ignoreTarget: true,
    execute: (_, action) => {
      const args = action.args.flat(3);
      if (args[0] == "#sceneId") {
        globalThis.Sequencer.EffectManager.endEffects();
      } else if (action.args[0].value == "#origin") {
        globalThis.Sequencer.EffectManager.endEffects({ origin: action.args[1].id });
      } else if (args.length >= 2) {
        const f = {};
        f[args[0].slice(1)] = args[1];
        globalThis.Sequencer.EffectManager.endEffects(f);
      }
    },
    args: [{ type: "effectSource", label: "source" }]
  },
];

export function addAction(action) {
  actionTypes.push(action);
}

export const sectionSpecs = [
  { id: 'effect', label: 'Effect', args: [{ type: 'string', label: 'name' }], group: "Sequencer", collapsible: true },
  { id: 'animation', label: 'Animation', group: "Sequencer", collapsible: true },
  { id: 'sound', label: 'Sound', group: "Sequencer", collapsible: true },
  { id: 'wait', label: 'Wait', args: [{ type: 'int', label: 'ms' }], group: "Sequencer", nonPlayable: true },
  { id: 'macro', label: 'Macro', args: [{ type: 'macro', label: 'name' }], group: "Sequencer" },
  { id: 'thenDo', label: 'thenDo', args: [{ type: 'code', label: 'func' }], group: "Sequencer" },

  {
    id: 'toggle',
    label: 'Toggle visibility',
    args: [{ type: 'placeable', label: 'target' }],
    group: "Actions",
    thenDo: (args) => () => tools.toggle(args[0].document),
    toCode: (args) => `\t.thenDo(async () => ${args[0]}.document.update({ hidden: !${args[0]}.document.data.hidden }))\n`,
  },
  {
    id: 'show',
    label: 'Show',
    args: [{ type: 'placeable', label: 'target' }],
    group: "Actions",
    thenDo: (args) => () => tools.show(args[0].document),
    toCode: (args) => `\t.thenDo(async () => ${args[0]}.document.update({ hidden: false }))\n`,
  },
  {
    id: 'hide',
    label: 'Hide',
    args: [{ type: 'placeable', label: 'target' }],
    group: "Actions",
    thenDo: (args) => () => tools.hide(args[0].document),
    toCode: (args) => `\t.thenDo(async () => ${args[0]}.document.update({ hidden: true }))\n`,
  },
  {
    id: 'kill',
    label: 'Kill',
    args: [{ type: 'token', label: 'target' }],
    group: "Actions",
    thenDo: (args) => () => tools.kill(args[0].document),
    toCode: (args) => `\t.thenDo(async () => ${args[0]}.document.actor.update({
      "data.attributes.hp.value": 0,
    }))\n`,
  },
  {
    id: 'revive',
    label: 'Revive',
    args: [{ type: 'token', label: 'target' }],
    group: "Actions",
    thenDo: (args) => () => tools.revive(args[0].document),
    toCode: (args) => `\t.thenDo(async () => ${args[0]}.document.actor.update({
      "data.attributes.hp.value": ${args[0]}.document.actor.data.data.attributes.hp.max,
    }))\n`,
  },
  {
    id: 'endEffect',
    label: 'End Effect',
    args: [{ type: 'effectSource', label: 'effect' }],
    group: "Sequencer",
    toCode: (_args) => {
      const args = [..._args].flat();
      if (args[0] == "#sceneId") {
        return `\t.thenDo(async () => Sequencer.EffectManager.endEffects())\n`;
      } else if (args[0] == "#origin" && args.length > 1) {
        return `\t.thenDo(async () => Sequencer.EffectManager.endEffects({ origin: ${args[1].id} }))\n`;
      } else if (args.length >= 2) {
        const f = {};
        f[args[0].slice(1)] = args[1];
        return `\t.thenDo(async () => Sequencer.EffectManager.endEffects(${JSON.stringify(f)}))\n`;
      }
      return ``;
    },
    thenDo: (_args) => {
      const args = [..._args].flat();
      return () => {
        if (args[0] == "#sceneId") {
          globalThis.Sequencer.EffectManager.endEffects();
        } else if (args[0] == "#origin") {
          globalThis.Sequencer.EffectManager.endEffects({ origin: args[1].id });
        } else if (args.length >= 2) {
          const f = {};
          f[args[0].slice(1)] = args[1];
          globalThis.Sequencer.EffectManager.endEffects(f);
        }
      }
    },
  },
];

export function addSection(section) {
  sectionSpecs.push(section);
}

export const modifierSpecs = [
  //Effect
  { id: 'file', group: 'effect', args: [{ type: 'effect_file', label: 'file' }], cat: "Required" },
  { id: 'atLocation', group: 'effect', args: [{ type: 'position', label: 'pos' }], cat: "Required" },
  //{ id: 'name', group: 'effect', args: [{ type: 'string', label: 'name' }], cat: "Generic" },

  { id: 'scaleToObject', group: 'effect', args: [{ type: 'float', label: 'scale' }], cat: "Scale" },
  { id: 'scale', group: 'effect', args: [{ type: 'float', label: 'scale' }], cat: "Scale" },
  { id: 'scaleIn', group: 'effect', args: [{ type: 'float', label: 'scale' }, { type: 'int', label: 'ms' }], cat: "Scale" }, // {ease: "easeInOutCubic"})
  { id: 'scaleOut', group: 'effect', args: [{ type: 'float', label: 'scale' }, { type: 'int', label: 'ms' }], cat: "Scale" }, // {ease: "easeInCubic"})
  { id: 'size', group: 'effect', args: [{ type: 'size', label: 'size' }], cat: "Scale" },

  { id: 'stretchTo', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: "bool", label: "attachTo", option: true }, { type: "bool", label: "cacheLocation", option: true }], cat: 'Move' },
  { id: 'attachTo', group: 'effect', args: [{ type: 'token', label: 'token' }], cat: 'Move' },
  { id: 'moveTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: "ease", label: "ease", option: true }], cat: 'Move' },
  { id: 'moveSpeed', group: 'effect', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },
  { id: 'snapToGrid', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },
  { id: 'anchor', group: 'effect', args: [{ type: 'size', label: 'val' }], cat: 'Move' },
  { id: 'spriteAnchor', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: 'Move' },
  { id: 'center', group: 'effect', args: [], cat: 'Move' },
  { id: 'offset', group: 'effect', args: [{ type: 'offset', label: 'offset' }, { type: 'bool', label: 'local', option: true }], cat: 'Move' },
  { id: 'spriteOffset', group: 'effect', args: [{ type: 'offset', label: 'offset' }], cat: 'Move' },

  { id: 'from', group: 'effect', args: [{ type: 'placeable', label: 'placeable' }], cat: 'Generic' },

  { id: 'rotateTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'randomRotation', group: 'effect', args: [], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, //  {ease: "easeInCubic"})
  { id: 'zeroSpriteRotation', group: 'effect', args: [{ type: 'bool', label: 'val' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },

  { id: 'fadeIn', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },
  { id: 'opacity', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: 'Fade' },

  { id: 'playbackRate', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: 'Generic' },

  { id: 'repeats', group: 'effect', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: 'Generic' },
  { id: 'delay', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'effect', args: [], cat: 'Generic' },
  { id: 'duration', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'effect', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },
  { id: 'private', group: 'effect', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },
  { id: 'missed', group: 'effect', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },
  { id: 'tint', group: 'effect', args: [{ type: 'color', label: 'color' }], cat: 'Generic' },

  { id: 'xray', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: 'Generic' },
  { id: 'mask', group: 'effect', args: [{ type: 'token', label: 'token' }], cat: 'Generic' },
  { id: 'text', group: 'effect', args: [{ type: 'string', label: 'text' }, { type: "color", label: "fill", option: true }, { type: "int", label: "fontSize", option: true }], cat: 'Generic' },

  { id: 'mirrorY', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },
  { id: 'mirrorX', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },
  { id: 'randomizeMirrorY', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },
  { id: 'randomizeMirrorX', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },

  { id: 'screenSpace', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Screen space" },
  { id: 'screenSpaceAboveUI', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Screen space" },
  { id: 'screenSpaceAnchor', group: 'effect', args: [{ type: 'offset', label: 'val' }], cat: "Screen space" },
  { id: 'screenSpacePosition', group: 'effect', args: [{ type: 'offset', label: 'val' }], cat: "Screen space" },

  { id: 'belowTokens', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },
  { id: 'belowTiles', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },
  { id: 'aboveLightning', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },
  { id: 'zIndex', group: 'effect', args: [{ type: 'int', label: 'val' }], cat: "Generic" },
  { id: 'locally', group: 'effect', args: [], cat: "Generic" },
  { id: 'noLoop', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },

  { id: 'persist', group: 'effect', args: [{ type: 'bool', label: 'val' }, { type: 'bool', label: 'persistTokenPrototype', option: true }], cat: "Time" },
  { id: 'startTime', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'startTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'endTime', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'endTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'extraEndDuration', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'timeRange', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: 'int', label: 'ms' }], cat: "Time" },

  //Animation
  { id: 'on', group: 'animation', args: [{ type: 'placeable', label: 'placeable' }], cat: 'Required' },

  { id: 'repeats', group: 'animation', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: "Generic" },
  { id: 'delay', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'animation', args: [], cat: 'Generic' },
  { id: 'duration', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'animation', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },

  { id: 'fade', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeIn', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' },
  { id: 'opacity', group: 'animation', args: [{ type: 'float', label: 'val' }], cat: 'Fade' },

  { id: 'moveTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: "ease", label: "ease", option: true }], cat: 'Move' },
  { id: 'moveSpeed', group: 'animation', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },
  { id: 'snapToGrid', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },
  { id: 'closestSquare', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },

  { id: 'offset', group: 'animation', args: [{ type: 'offset', label: 'offset' }], cat: 'Move' },

  { id: 'rotateTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, //  {ease: "easeInCubic"})

  { id: 'tint', group: 'animation', args: [{ type: 'color', label: 'color' }], cat: 'Generic' },
  { id: 'hide', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },
  { id: 'show', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },

  { id: 'teleportTo', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'bool', label: 'relativeToCenter', option: true }], cat: 'Move' },

  { id: 'volume', group: 'animation', args: [{ type: 'int', label: 'min' }, { type: 'int', label: 'max' }], cat: "Generic" },
  { id: 'fadeInAudio', group: 'animation', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOutAudio', group: 'animation', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },

  //Sound
  { id: 'file', group: 'sound', args: [{ type: 'sound_file', label: 'file' }], cat: "Required" },
  { id: 'volume', group: 'sound', args: [{ type: 'int', label: 'min' }, { type: 'int', label: 'max' }], cat: "Generic" },

  { id: 'repeats', group: 'sound', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: "Generic" },
  { id: 'delay', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'sound', args: [], cat: 'Generic' },
  { id: 'duration', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'sound', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },

  { id: 'fadeInAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOutAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },

  { id: 'startTime', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'startTimePerc', group: 'sound', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'endTime', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'endTimePerc', group: 'sound', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'locally', group: 'sound', args: [], cat: "Generic" },
];


export function addModifier(modifier) {
  modifierSpecs.push(modifier);
}

function targetFromActor(target, ...args) {
  const tokensId = globalThis.canvas.scene.tokens.filter(t => t.actor.id == args[0].id).map(t => t.id);
  return [args[0].id, ...tokensId].includes(target.id);

}
function targetFromToken(target, ...args) {
  return [args[0].id].includes(target.id);
}

export const hookSpecs = [
  {
    id: "#onHit",
    name: "On Hit",
    parents: ["updateActor"],
    target: targetFromActor,
    test: (ts, limit, actor, _, updates) => {
      return (ts > 0 && updates.prevHp - actor.data.data.attributes.hp.value >= ts) || actor.data.data.attributes.hp.value / actor.data.data.attributes.hp.max * 100 <= limit;
    }, args: [{ type: "int", label: "threshold" }, { type: "int", label: "drop lower %" }]
  },
  {
    id: "#onHeal",
    name: "On Heal",
    parents: ["updateActor"],
    target: targetFromActor,
    test: (ts, actor, _, updates) => {
      return actor.data.data.attributes.hp.value - updates.prevHp >= ts;
    }, args: [{ type: "int", label: "threshold" }]
  },
  {
    id: "#onDeath",
    name: "On Death",
    parents: ["updateActor"],
    target: targetFromActor,
    test: (actor, _) => actor.data.data.attributes.hp.value <= 0
  },
  {
    id: "#onMove",
    name: "On Move",
    parents: ["updateToken"],
    target: targetFromToken,
    test: (token, updates, _) => "x" in updates || "y" in updates || "elevation" in updates
  },

  {
    id: "#onTokenProperty",
    name: "Token's property change",
    parents: ["updateToken"],
    target: targetFromToken,
    test: (prop, ts, token, _, updates) => {
      return getProperty(updates.prevTokenData, prop) - getProperty(token.data, prop) >= ts;
    },
    args: [{ type: "string", label: "property" }, { type: "int", label: "threshold" }]
  },
  {
    id: "#onTokenPropertyProc",
    name: "% of Token's property change",
    parents: ["updateToken"],
    target: targetFromToken,
    test: (prop, ts, prop2, token, _, updates) => {
      return (getProperty(updates.prevTokenData, prop) - getProperty(token.data, prop)) / getProperty(updates.prevTokenData, prop2) * 100 >= ts;
    },
    args: [{ type: "string", label: "property" }, { type: "int", label: "threshold %" }, { type: "string", label: "of property" }]
  },
  {
    id: "#onActorProperty",
    name: "Actor's property change",
    parents: ["updateActor"],
    target: targetFromActor,
    test: (prop, ts, actor, _, updates) => {
      return getProperty(updates.prevData, prop) - getProperty(actor.data.data, prop) >= ts;
    }, args: [{ type: "string", label: "property" }, { type: "int", label: "threshold" }]
  },
  {
    id: "#onActorPropertyProc",
    name: "% of Actor's property change",
    parents: ["updateActor"],
    target: targetFromActor,
    test: (prop, ts, prop2, actor, _, updates) => {
      return (getProperty(updates.prevData, prop) - getProperty(actor.data.data, prop)) / getProperty(updates.prevData, prop2) * 100 >= ts;
    }, args: [{ type: "string", label: "property" }, { type: "int", label: "threshold %" }, { type: "string", label: "of property" }]
  },
  {
    id: "#onUpdateActor",
    name: "Generic updateActor",
    parents: ["updateActor"],
    target: targetFromActor,
    test: (prop, ...args) => {
      let code = `try {return ${prop}} catch(e) {return false}`;
      const f = new Function("actor", "delta", "updates", "userId", "...args", code);
      return f(...args, ...args)
    }, args: [{ type: "expression", label: "test" }]
  },
  {
    id: "#onUpdateToken",
    name: "Generic updateToken",
    parents: ["updateToken"],
    target: targetFromToken,
    test: (prop, ...args) => {
      let code = `try {return ${prop}} catch(e) {return false}`;
      const f = new Function("token", "delta", "updates", "userId", "...args", code);
      return f(...args, ...args)
    }, args: [{ type: "expression", label: "test" }]
  },
  {
    id: "#setInterval",
    name: "Set Interval",
    parents: [],
    test: (prop, ...args) => {
      return evalExpression(prop, ...args);
    }, args: [{ type: "expression", label: "test" }, { type: "expression", label: "interval" }]
  },
];

export function addHook(hook) {
  hookSpecs.push(hook);
}

export const argSpecs = [
  {
    id: "position", options: [
      { value: "#controlled.first", label: "First Controlled", group: "Controlled" },
      { value: "#controlled.last", label: "Last Controlled", group: "Controlled" },
      { value: "#target.first", label: "First Target", group: "Targets" },
      { value: "#target.last", label: "Last Target", group: "Targets" },
      { value: "#manual", label: "Manual", group: "Other", lazy: true },
      { value: { x: 0, y: 0 }, label: "Fixed", group: "Other" },
      { value: [], label: "Tagger", group: "Other" },
    ], var_types: ["position", "token", "tile", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "offset", var_types: ["offset", "size", "position", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "size", var_types: ["offset", "size", "position", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "placeable", options: [
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["placeable", "token", "tile", "expression"]
  },
  {
    id: "token", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
      { value: [], label: "Tagger" },
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["token", "expression"]
  },
  {
    id: "tile", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: [], label: "Tagger" },
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["tile", "expression"]
  },
  {
    id: "targets", options: [
      { value: "#controlled.all", label: "All Controlled", group: "Controlled" },
      { value: "#controlled.random", label: "Random Controlled", group: "Controlled" },
      { value: "#controlled.first", label: "First Controlled", group: "Controlled" },
      { value: "#controlled.last", label: "Last Controlled", group: "Controlled" },
      { value: "#target.all", label: "All Targets", group: "Targets" },
      { value: "#target.random", label: "Random Target", group: "Targets" },
      { value: "#target.first", label: "First Target", group: "Targets" },
      { value: "#target.last", label: "Last Target", group: "Targets" },
      { value: "#id:", label: "Id or Name", group: "Other" },
      { value: "#tokens.all", label: "All Tokens", group: "Other" },
      { value: "#tiles.all", label: "All Tiles", group: "Other" },
      { value: [], label: "Tagger", group: "Other" },
    ]
  },
  {
    id: "bool", var_types: ["bool", "expression"], default: false,
  },
  { id: "effect_file", var_types: ["effect_file", "expression"] },
  { id: "sound_file", var_types: ["sound_file", "expression"] },
  { id: "int", var_types: ["int", "expression"] },
  { id: "float", var_types: ["float", "int", "expression"] },
  { id: "macro", var_types: ["macro", "string", "expression"] },
  { id: "string", var_types: ["string", "expression"] },
  { id: "color", var_types: ["string", "color", "expression"] },
  { id: "code", var_types: ["code", "string", "expression"] },
  { id: "expression", var_types: ["expression"] },
  {
    id: "sequence", var_types: ["sequence"], options: (_) => {
      return Director.listSequences().map(s => { return { value: s.id, label: s.title } });
    }
    , control: "select"
  },
  {
    id: "sequence-vars", var_types: ["sequence-vars"], options: (_, extra) => {
      const seqId = extra.args[0];
      if (!seqId) return [];
      const seq = Director.findSequence(seqId);
      if (!seq) return [];
      let vars = seq.variables.map(v => { return { value: v.name, label: v.name } });
      vars = [{ value: "_", label: "None" }, ...vars];
      return vars;
    }, control: "select"
  },
  {
    id: "hook", var_types: ["hook"], options: (_) => {
      return hookSpecs.map((hook) => {
        return { "value": hook.id, "label": hook.name };
      });
    }, control: "select"
  },
  {
    id: "action-type", var_types: ["action-type"], options: (_) => {
      return actionTypes.map((type) => {
        return { "value": type.id, "label": type.label, group: type.group };
      });
    }, control: "select"
  },
  {
    id: "effectSource", var_types: ["effect"], options: [
      { value: ["#sceneId"], label: "All on the scene" },
      { value: ["#origin"], label: "From sequence" },
      { value: ["#name"], label: "By name" },
      { value: ["#object"], label: "By object" },
      { value: ["#target"], label: "By target" },
      { value: ["#source"], label: "By source" },
    ]
  },
  {
    id: "ease", var_types: ["ease", "expression"], options: [
      { value: "linear", label: "linear" },
      { value: "easeInSine", label: "InSine" },
      { value: "easeOutSine", label: "OutSine" },
      { value: "easeInOutSine", label: "InOutSine" },
      { value: "easeInQuad", label: "InQuad" },
      { value: "easeOutQuad", label: "OutQuad" },
      { value: "easeInOutQuad", label: "InOutQuad" },
      { value: "easeInCubic", label: "InCubic" },
      { value: "easeOutCubic", label: "OutCubic" },
      { value: "easeInOutCubic", label: "InOutCubic" },
      { value: "easeInQuart", label: "InQuart" },
      { value: "easeOutQuart", label: "OutQuart" },
      { value: "easeInOutQuart", label: "InOutQuart" },
      { value: "easeInQuint", label: "InQuint" },
      { value: "easeOutQuint", label: "OutQuint" },
      { value: "easeInOutQuint", label: "InOutQuint" },
      { value: "easeInExpo", label: "InExpo" },
      { value: "easeOutExpo", label: "OutExpo" },
      { value: "easeInOutExpo", label: "InOutExpo" },
      { value: "easeInCirc", label: "InCirc" },
      { value: "easeOutCirc", label: "OutCirc" },
      { value: "easeInOutCirc", label: "InOutCirc" },
      { value: "easeInBack", label: "InBack" },
      { value: "easeOutBack", label: "OutBack" },
      { value: "easeInOutBack", label: "InOutBack" },
      { value: "easeInElastic", label: "InElastic" },
      { value: "easeOutElastic", label: "OutElastic" },
      { value: "easeInOutElastic", label: "InOutElastic" },
      { value: "easeInBounce", label: "InBounce" },
      { value: "easeOutBounce", label: "OutBounce" },
      { value: "easeInOutBounce", label: "InOutBounce" },
    ]
  }
];

export function addArgSpec(arg) {
  argSpecs.push(arg);
}
