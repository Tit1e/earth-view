const app = {
  data () {
    return {
      defaultProps: {
        label: 'title'
      },
      drawer: false,
      oldIndex: null,
      newIndex: null,
      isEdit: false,
      activeItem: null,
    }
  },
  setup (props) {
    const background = Vue.ref('')
    const getEarthPic = () => {
      const dataLength = PHOTOS.length
      const index = parseInt(Math.random() * dataLength)
      const url = PHOTOS[index]
      fetch(url)
        .then(response => response.json())
        .then(data => {
          background.value = data.dataUri
          localStorage.setItem('images', data.dataUri)
        }).catch(() => {
          const image = localStorage.getItem('images')
          background.value = image ? image: ''
        })
    }
    getEarthPic()
    const bookMarksData = Vue.ref([{children: []}])
    const getBookMarkTree = () => {
      chrome.bookmarks.getTree(bookmarkArray => {
        bookMarksData.value = bookmarkArray
      })
    }
    getBookMarkTree()


    const setStorage = (bookmarks) => {
      return window.localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
    }
    const getStorage = () => {
      return JSON.parse(window.localStorage.getItem('bookmarks')) || []
    }

    const bookmarks = getStorage()
    return {
      background,
      bookmarks,
      bookMarksData,
      getStorage,
      setStorage
    }
  },
  methods: {
    changeMarkIndex(oldIndex, newIndex) {
      const changeItem = this.bookmarks.splice(oldIndex, 1)[0];
      this.bookmarks.splice(newIndex, 0, changeItem)
      this.setStorage(this.bookmarks)
    },
    handleDrop() {
      if (this.oldIndex !== this.newIndex) {
        this.changeMarkIndex(this.oldIndex, this.newIndex)
      }
      this.oldIndex = null
      this.newIndex = null
    },
    handleDragstart(index) {
      this.oldIndex = index
    },
    handleDragover(index) {
      this.newIndex = index
    },
    save() {
      this.getCheckedNodes()
      this.drawer = false
    },
    getCheckedNodes() {
      const oldBookmarks = []
      const newBookmarks = []
      const nodes = this.$refs.tree.getCheckedNodes().filter(i => i.url)
      nodes.forEach(node => {
        const index = this.bookmarks.findIndex(bookmark => bookmark.id === node.id)
        if (index !== -1) {
          oldBookmarks[index] = this.bookmarks[index]
        } else {
          newBookmarks.push(node)
        }
      })
      const result = oldBookmarks.filter(i => i).concat(newBookmarks)
      this.bookmarks = result
      this.setStorage(this.bookmarks)
    },
    setChecked() {
      const bookmarks = this.getStorage()
      this.$refs.tree.setCheckedNodes(bookmarks)
    },
    toggleEdit() {
      this.isEdit = !this.isEdit
      if (!this.isEdit) {
        this.setStorage(this.bookmarks)
      }
    },
    openDrawer() {
      this.drawer = true
    },
    getOrginUrl (url) {
      return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    },
    bgUrl(url) {
      if (navigator.onLine) {
        return `https://managing-rose-mollusk.b-cdn.net/${this.getOrginUrl(url)}/64`
      } else {
        return `chrome://favicon2/?size=24&scale_factor=1x&show_fallback_monogram=&page_url=${url}`
      }
    },
    open(url) {
      if(this.isEdit) return
      chrome.tabs.create({url})
    }
  }
}
const vm = Vue.createApp(app)
vm.use(ElementPlus)
vm.mount('#app')


const img = document.querySelector('#bg')
img.onload = function () {
  img.style.opacity = 1
}