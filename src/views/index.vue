<template>
  <div class="absolute top-0 right-0 m-4">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="goRank">排行榜</button>
  </div>
  <div class="h-screen w-screen" ref="canvasBox">
    <div ref="myCanvas"></div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
// import * as Phaser from 'Phaser'
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin.js'
import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin.js'
import Game from '../components/game.js'
import Boot from '../components/boot.js'
import Preloader from '../components/preloader.js'
import { useRouter } from 'vue-router'

let myCanvas = ref(null)
let canvasBox = ref(null)
let game
const router = useRouter()

onMounted(() => {
  let config = {
    type: Phaser.AUTO,
    render: {
      pixelArt: true, // 像素风格
      antialias: false, // 抗锯齿
      transparent: true, // 透明背景
    },
    width: canvasBox.value.clientWidth,
    height: canvasBox.value.clientHeight,
    parent: myCanvas.value,
    dom: {
      createContainer: true,
    },
    input: {
      mouse: {
        target: myCanvas.value,
      },
      touch: {
        target: myCanvas.value,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    title: 'Author QQ：296720094',
    url: 'https://wxbuluo.com',
    banner: false,
    // backgroundColor: '#fff',
    scene: [Boot, Preloader, Game],
    // 禁用右键菜单
    disableContextMenu: true,
    plugins: {
      global: [
        {
          key: 'rexRoundRectanglePlugin',
          plugin: RoundRectanglePlugin,
          start: true,
        },
        {
          key: 'rexInputTextPlugin',
          plugin: InputTextPlugin,
          start: true,
        },
      ],
    },
  }
  game = new Phaser.Game(config)
})

const goRank = () => {
  router.push('/rank')
}

onUnmounted(() => {
  for (let key in game.scene.keys) {
    if (game.scene.keys.hasOwnProperty(key)) {
      game.scene.stop(key)
      game.scene.keys[key] = undefined
    }
  }
})
</script>
<style scoped>
.w-430 {
  width: 430px;
}
.h-430 {
  height: 480px;
}
</style>
