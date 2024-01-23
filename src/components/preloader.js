import PickUp from '../assets/sounds/pickup.mp3'
import Music from '../assets/sounds/music.mp3'
import Victory from '../assets/sounds/victory.mp3'
import store from '../store/index.js'
import { getUserInfo } from '../api/user.js'
import { useToast } from '@/components/ui/toast/use-toast'
import Push from '../utils/push.js'

const { toast } = useToast()
export default class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader')
    let s = this
    this.loadText
    this.connection = new Push({
      url: 'wss://demo.api.wxbuluo.com',
      app_key: '75e2a20dbb1078b991bca38aa55e9dc2',
      auth: '/plugin/webman/push/auth',
    })

    this.public_channel = this.connection.subscribe('public')

    this.public_channel.on('message', function (data) {
      toast({
        description: data.content,
      })

      if (Notification && Notification.permission === 'granted') {
        s.showNotification(data.content)
      }
    })

    if (!Notification) {
      console.log('您的浏览器不支持桌面通知。')
    } else {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission()
      }
    }
  }

  preload() {
    this.progressValue = 0
    this.loadText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'Loading 0%', {
      fontSize: '32px',
      fill: '#fff',
    })
    this.loadText.setOrigin(0.5)
    this.loadText.setStroke('#000', 6)
    this.loadText.setShadow(2, 2, '#333333', 2, true, true)

    this.load.audio('pickup', PickUp)
    this.load.audio('victory', Victory)
    this.load.audio('music', Music)

    this.load.on('fileprogress', (file, value) => {
      switch (file.key) {
        case 'pickup':
          this.pickupProgress = value
          break
        case 'victory':
          this.victoryProgress = value
          break
        case 'music':
          this.musicProgress = value
          break
      }
      this.progressValue = ((this.pickupProgress + this.victoryProgress + this.musicProgress) / 3) * 100

      this.loadText.setText(`Loading ${Math.round(this.progressValue)}%`)
    })
  }

  create() {
    this.nickname = store.state.nickname
    this.userId = store.state.userId

    if (this.sound.locked || !this.nickname || !this.userId) {
      this.loadText.destroy()

      const inputText = this.add.rexInputText(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 200, 30, {
        type: 'text',
        placeholder: 'your name',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#000',
        border: '1px solid #fff',
        borderRadius: '10px',
        padding: '5px',
        textAlign: 'center',
        fixedWidth: 200,
        fixedHeight: 30,
        text: this.nickname,
      })

      const inputPassword = this.add.rexInputText(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 40, 200, 30, {
        type: 'password',
        placeholder: 'your password',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#000',
        border: '1px solid #fff',
        borderRadius: '10px',
        padding: '5px',
        textAlign: 'center',
        fixedWidth: 200,
        fixedHeight: 30,
      })

      const button = this.add
        .text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 100, 'Start', {
          fontSize: '32px',
          fill: '#000',
        })
        .setInteractive()
        .setOrigin(0.5)

        .on('pointerover', () => {
          this.tweens.add({
            targets: button,
            scale: 1.2,
            duration: 300,
          })
        })

        .on('pointerout', () => {
          this.tweens.add({
            targets: button,
            scale: 1,
            duration: 300,
          })
        })

        .on('pointermove', () => {
          this.sys.canvas.style.cursor = 'pointer'
        })

        .on('pointerdown', () => {
          if (inputText.text === '' || inputPassword.text === '') {
            return
          }

          getUserInfo(inputText.text, inputPassword.text).then((res) => {
            store.commit('setNickname', res.nickname)
            store.commit('setUserId', res.id)

            inputText.destroy()
            button.destroy()

            this.scene.start('Game')
          })
        })
    } else {
      this.scene.start('Game')
    }
  }

  showNotification(content) {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    } else {
      const options = {
        body: content,
        dir: 'ltr',
      }
      const notification = new Notification('数字方格', options)
      notification.onclick = function () {
        window.open('https://demo.wxbuluo.com/digital')
      }
    }
  }
}
