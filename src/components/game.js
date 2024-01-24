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

    if (this.sys.game.device.os.desktop) {
      this.itemWidth = Math.round(this.sys.game.config.height / 2 / this.dimension)
    } else {
      this.itemWidth = Math.round((this.sys.game.config.width - 20 - 5 * this.dimension) / this.dimension)
    }

    this.itemPadding = 5

    this.createCompleteStr()

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        const gameItem = new GameItem(this, 0, 0, this.itemWidth, this.numbers[i][j], i, j)

        this.gameItems.push(gameItem)
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

    this.input.on('gameobjectdown', async (pointer, gameObject) => {
      if (this.tweensArr) {
        for (let i = 0; i < this.tweensArr.length; i++) {
          if (this.tweensArr[i].isPlaying()) {
            return false
          }
        }
      }

      this.sound.play('pickup')

      if (!this.timeStart) {
        this.timeStart = true
      }
      this.zeroIndex = this.findNumberIndex(0)

      const { i, j } = gameObject

      const { i: zeroI, j: zeroJ } = this.gameItems[this.zeroIndex]

      let exceptZeroNumbers = []

      if (i === zeroI || (j === zeroJ && !(i === zeroI && j === zeroJ))) {
        if (i === zeroI) {
          if (j < zeroJ) {
            for (let k = j; k < zeroJ; k++) {
              exceptZeroNumbers.push(this.numbers[i][k])
            }
            exceptZeroNumbers.reverse()
          } else {
            for (let k = zeroJ + 1; k <= j; k++) {
              exceptZeroNumbers.push(this.numbers[i][k])
            }
          }
        }

        if (j === zeroJ) {
          if (i < zeroI) {
            for (let k = i; k < zeroI; k++) {
              exceptZeroNumbers.push(this.numbers[k][j])
            }
            exceptZeroNumbers.reverse()
          } else {
            for (let k = zeroI + 1; k <= i; k++) {
              exceptZeroNumbers.push(this.numbers[k][j])
            }
          }
        }

        const exceptZeroNumbersIndex = []
        exceptZeroNumbers.forEach((item) => {
          exceptZeroNumbersIndex.push(this.findNumberIndex(item))
        })
        const moveNumberArr = []

        for (let k = 0; k < exceptZeroNumbersIndex.length; k++) {
          if (k === 0) {
            moveNumberArr.push({
              number: this.gameItems[exceptZeroNumbersIndex[k]],
              x: this.gameItems[this.zeroIndex].x,
              y: this.gameItems[this.zeroIndex].y,
              i: this.gameItems[this.zeroIndex].i,
              j: this.gameItems[this.zeroIndex].j,
            })
          } else {
            moveNumberArr.push({
              number: this.gameItems[exceptZeroNumbersIndex[k]],
              x: this.gameItems[exceptZeroNumbersIndex[k - 1]].x,
              y: this.gameItems[exceptZeroNumbersIndex[k - 1]].y,
              i: this.gameItems[exceptZeroNumbersIndex[k - 1]].i,
              j: this.gameItems[exceptZeroNumbersIndex[k - 1]].j,
            })
          }
        }

        moveNumberArr.push({
          number: this.gameItems[this.zeroIndex],
          x: gameObject.x,
          y: gameObject.y,
          i: gameObject.i,
          j: gameObject.j,
        })
        this.moveNumber(moveNumberArr)
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

  findNumberIndex(num) {
    for (let i = 0; i < this.gameItems.length; i++) {
      if (this.gameItems[i].number === num) {
        return i
      }
    }
  }

  moveNumber(arr) {
    this.tweensArr = []
    for (let i = 0; i < arr.length; i++) {
      const tween = this.tweens.add({
        targets: arr[i].number,
        x: arr[i].x,
        y: arr[i].y,
        duration: 100,
        ease: 'Linear',
        onComplete: () => {
          this.numbers[arr[i].i][arr[i].j] = arr[i].number.number

          arr[i].number.i = arr[i].i
          arr[i].number.j = arr[i].j

          this.isComplete()
        },
      })

      this.tweensArr.push(tween)
    }
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
