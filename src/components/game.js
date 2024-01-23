import GameItem from './gameItem.js'
import store from '../store/index.js'
import Swal from 'sweetalert2'
import { addRecord } from '../api/user.js'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
    this.dimension = 3
    this.timeValue = 0
  }

  create() {
    if (!this.sound.get('music')) {
      this.sound.play('music', { loop: true })
    }
    this.gameItems = []
    this.numbers = []

    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
      this.itemWidth = Math.round((this.sys.game.config.width - 20 - 5 * this.dimension) / this.dimension)
    } else {
      this.itemWidth = Math.round(this.sys.game.config.height / 2 / this.dimension)
    }

    this.itemPadding = 5
    this.createCompleteStr()

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        const gameItem = new GameItem(this, 0, 0, this.itemWidth, this.numbers[i][j], i, j)
        this.gameItems.push(gameItem)
        if (this.numbers[i][j] === 0) {
          this.zeroIndex = this.gameItems.length - 1
        }
      }
    }

    const fontStyle = {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#ffffff',
      fontStyle: 'bold',
      padding: 5,
      shadow: {
        color: '#000000',
        fill: true,
        offsetX: 2,
        offsetY: 2,
        blur: 4,
      },
    }

    this.timeText = this.add.text(0, -40, 'time：0', fontStyle)

    const nicknameText = this.add.text(0, -80, `${store.state.nickname}`, fontStyle)
    this.add.existing(this.timeText)

    this.timer = this.time.addEvent({
      delay: 1,
      callback: () => {
        if (this.timeStart) {
          this.timeValue++
          this.second = Math.floor(this.timeValue / 1000)
          this.millisecond = this.timeValue % 1000
          this.timeText.setText(`time：${this.second}'${this.millisecond}''`)
        }
      },
      callbackScope: this,
      loop: true,
    })

    this.input.on('gameobjectdown', (pointer, gameObject) => {
      this.sound.play('pickup')
      if (!this.timeStart) {
        this.timeStart = true
      }
      const { x, y } = gameObject
      const { x: zeroX, y: zeroY } = this.gameItems[this.zeroIndex]

      if ((x === zeroX && Math.abs(y - zeroY) === this.itemWidth + this.itemPadding) || (y === zeroY && Math.abs(x - zeroX) === this.itemWidth + this.itemPadding)) {
        this.swapNumber(gameObject, this.gameItems[this.zeroIndex])

        this.swapNumberInArray(gameObject, this.gameItems[this.zeroIndex])
      }
    })

    const container = this.add.container(0, 0, this.gameItems)

    container.setSize(this.itemWidth * this.dimension + this.itemPadding * (this.dimension - 1), this.itemWidth * this.dimension + this.itemPadding * (this.dimension - 1))

    const containerWidth = container.width
    const containerHeight = container.height

    const containerCenterX = containerWidth / 2
    const containerCenterY = containerHeight / 2

    const mainCamera = this.cameras.main

    mainCamera.centerOn(containerCenterX, containerCenterY)

    Phaser.Actions.GridAlign(this.gameItems, {
      width: this.dimension,
      height: this.dimension,

      cellWidth: this.itemWidth + this.itemPadding,
      cellHeight: this.itemWidth + this.itemPadding,
      x: 0,
      y: 0,
      position: Phaser.Display.Align.TOP_LEFT,
    })
  }

  swapNumber(number1, number2) {
    const { x: x1, y: y1 } = number1
    const { x: x2, y: y2 } = number2

    this.tweens.add({
      targets: number1,
      x: x2,
      y: y2,
      duration: 100,
      ease: 'Linear',
    })
    this.tweens.add({
      targets: number2,
      x: x1,
      y: y1,
      duration: 100,
      ease: 'Linear',
    })
  }

  swapNumberInArray(number1, number2) {
    const { i: x1, j: y1 } = number1
    const { i: x2, j: y2 } = number2
    const temp = this.numbers[x1][y1]
    this.numbers[x1][y1] = this.numbers[x2][y2]
    this.numbers[x2][y2] = temp

    number1.i = x2
    number1.j = y2
    number2.i = x1
    number2.j = y1

    this.isComplete()
  }

  createCompleteStr() {
    this.completeArr = []
    this.completeStr = ''
    for (let i = 1; i < this.dimension * this.dimension; i++) {
      this.completeArr.push(i)
    }
    this.completeArr.push(0)
    this.completeStr = this.completeArr.join(',')

    this.numbers = []
    for (let i = 0; i < this.completeArr.length; i += this.dimension) {
      this.numbers.push(this.completeArr.slice(i, i + this.dimension))
    }

    for (let i = 0; i < 10000; i++) {
      let zeroI = 0
      let zeroJ = 0
      for (let i = 0; i < this.dimension; i++) {
        for (let j = 0; j < this.dimension; j++) {
          if (this.numbers[i][j] === 0) {
            zeroI = i
            zeroJ = j
          }
        }
      }

      const direction = Math.floor(Math.random() * 4)
      switch (direction) {
        case 0:
          if (zeroI - 1 >= 0) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI - 1][zeroJ]
            this.numbers[zeroI - 1][zeroJ] = temp
          }
          break
        case 1:
          if (zeroI + 1 < this.dimension) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI + 1][zeroJ]
            this.numbers[zeroI + 1][zeroJ] = temp
          }
          break
        case 2:
          if (zeroJ - 1 >= 0) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI][zeroJ - 1]
            this.numbers[zeroI][zeroJ - 1] = temp
          }
          break
        case 3:
          if (zeroJ + 1 < this.dimension) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI][zeroJ + 1]
            this.numbers[zeroI][zeroJ + 1] = temp
          }
          break
      }
    }
  }

  isComplete() {
    let isComplete = true

    let arr = []
    let str = ''
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        arr.push(this.numbers[i][j])
      }
    }

    str = arr.join(',')
    if (str === this.completeStr) {
      isComplete = true
    } else {
      isComplete = false
    }
    if (isComplete) {
      this.timeStart = false
      this.sound.play('victory')
      addRecord(this.dimension, this.timeValue)

      setTimeout(() => {
        const result = window.confirm(`恭喜你，完成了！用时：${this.second}'${this.millisecond}''，是否继续挑战第${this.dimension + 1}维？`)
        if (result) {
          this.dimension++
        }

        this.timeValue = 0

        this.timer.remove()
        this.scene.restart()
      }, 200)
    }
  }
}
