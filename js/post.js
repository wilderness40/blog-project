const postContents = document.querySelector('.post-container .post-contents')

window.addEventListener("load", (event) => {
  // 테마변경 (다크모드/ 일반모드)
  const mode = document.querySelector('.mode')
  const icons = mode.querySelectorAll('.fa-solid')
  const header = document.querySelector('header')

  const title = document.querySelector('.post-container .post-title input')
  
  const tagInput = document.querySelector('.post-container .post-tags input')

  mode.addEventListener('click', (event) => {
    document.body.classList.toggle('dark')
    header.classList.toggle('dark')

    title.classList.toggle('dark')
    postContents.classList.toggle('dark')
    tagInput.classList.toggle('dark')
    
    
    for(const icon of icons){
      icon.classList.contains('active') ? 
        icon.classList.remove('active') 
        : icon.classList.add('active')
    }
  })
  // 태그입력 기능
  const tagList = document.querySelector('.post-container .post-tags ul')
  const tagslimit = 10 // 태그 갯수 제한
  const tagLength = 10 // 태그 글자수 제한

  tagInput.addEventListener('keyup', function(event){ 
    console.log(this) 
    // 화살표함수를 사용하면 this값이 window 객체를 가르키게 됨, 그래서 function을 사용함, function 안에서 this는 input을 가르키게됨
    console.log('태그 입력중 ...', event.key, tagInput.value)
    
    const trimTag = this.value.trim() // 글짜 양쪽에 공백을 제거
    if(event.key === 'Enter' && trimTag !== '' && trimTag.length <= tagLength && tagList.children.length < tagslimit){
      const tag = document.createElement('li')
      tag.innerHTML = `#${trimTag}<a href='#'>x</a>`
      tagList.appendChild(tag)
      // 태그는 한번만 생성되고 더이상 실행되지 않는 코드 
      // 기존 element 안에 같은 태그 요소가 있고 이벤트핸들러가 있을 경우에 innerHTML로 같은 태그를 업데이트하면 기존의 이벤트핸들러함수가 사라져버린다 그래서 아래 코드는 사용할수 없음, 두개이상 추가안됨
      // tagList.innerHTML += `<li>#${trimTag.trim()}<a href='#'>x</a></li>` 
      // tagInput.value = ''
      this.value= '' // 입력창 초기화
    }
  })
  // 태그 삭제기능 (이벤트 위임)
  tagList.addEventListener('click', function(event){
    console.log(event.target, event.target.parentElement, event.target.hasAttribute('href'))

    event.preventDefault() // 태그 삭제후 브라우저 상단으로 이동하는 문제 해결
    if(event.target.hasAttribute('href')){ // 취소(x)를 클릭하는 경우 (a 태그인지 확인)
      tagList.removeChild(event.target.parentElement)  // 클릭이 발생한 a 요소의 부모요소인 li 태그 삭제
    }
  })

  // 파일입력 처리
  postContents.focus() // 첫 로딩때 커서 보이기
  postContents.insertAdjacentElement("afterbegin", createNewLine())
  let lastCaretLine = postContents.firstChild // Caret : 커서를 의미 (커서 위치의 엘리먼트)
  const uploadInput = document.querySelector('.upload input')
  uploadInput.addEventListener('change', function(event){
    const files = this.files
    console.log(files)

    if(files.length > 0){
      for(const file of files){
        const fileType = file.type
        console.log(fileType)
        if(fileType.includes('image')){
          console.log('image')
          const img = buildMediaElement('img', 
          {src:URL.createObjectURL(file)})
         lastCaretLine = addFileToCurrentLine(lastCaretLine, img)
         
        }else if(fileType.includes('video')){
          console.log('video')

          const video = buildMediaElement('video', 
          { className: 'video-file', controls: true, src: URL.createObjectURL(file)})
          lastCaretLine = addFileToCurrentLine(lastCaretLine, video)
        }else if(fileType.includes('audio')){
          console.log('audio')
          const audio = buildMediaElement('audio', {className: 'audio-file', controls:true, 
          src:URL.createObjectURL(file) })
          lastCaretLine = addFileToCurrentLine(lastCaretLine, audio)
        }else{
          // 편집기의 마지막 커서 위치에 파일 추가 
          console.log('file', file.name, file.size)
          const div = document.createElement('div')
          div.className = 'normal-file'
          div.contentEditable = false // 편집이 되지 않도록 막아둠
          div.innerHTML = `
            <div class='file-icon'>
            <span class='material-icons'>folder</span>
            </div>
            <div class='file-info'>
            <h3>${getFileName(file.name, 70)}</h3>
            <p>${getFileSize(file.size)}</p>
            </div>
          `
          lastCaretLine = addFileToCurrentLine(lastCaretLine, div)

        }
      }

      // 커서위치를 맨 마지막으로 추가한 파일 아래쪽에 보여주기
      const selection = document.getSelection() //사용자가 드래그로 선택한 범위
      selection.removeAllRanges() //초기화

      // 해당 엘리먼트를 범위로 지정
      const range = document.createRange()
      range.selectNodeContents(lastCaretLine)
      range.collapse() // 범위가 아니라 커서를 지정
      selection.addRange(range) // 새로운 범위가 설정됨
      postContents.focus() // 편집기에 커서 보여주기
    }
  })
   /* 커서 위치에 파일 삽입하기
          1.이미지 업로드 버튼을 위해 아이콘 클릭시 blur이벤트가 발생한다
          2.addEventListener blur 이벤트를 사용, 커서위치에 엘리먼트를 저장한다
          3.커서 위치 위쪽에 파일을 추가한다 */
  postContents.addEventListener('blur', function(event){
     // 편집기가 blur될때 마지막 커서 위치에 있는 엘리먼트
     // document.getSelection() : 사용자가 드래그해서 선택한 부분(범위)
    lastCaretLine = document.getSelection().anchorNode
    console.log(lastCaretLine.parentNode, lastCaretLine, lastCaretLine.length)
  }) //blur는 focus의 반대 이벤트다
  // 텍스트 포맷
  const textTool = document.querySelector('.text-tool')
  const colorBoxes = textTool.querySelectorAll('.text-tool .color-box')
  const fontBox = textTool.querySelector('.text-tool .font-box')
  const toolBox = document.querySelector('.toolbox')

  textTool.addEventListener('click', function(event){
    event.stopPropagation() //document 클릭 이벤트와 충돌하지 않도록 설정
    event.preventDefault()
    console.log(event.target)
    switch(event.target.innerText){
      case 'format_bold' : 
        changeTextFormat('bold') // 사용자가 선택한 텍스트가 볼드채로 변경
        break
      case 'format_italic' : 
        changeTextFormat('italic') // 사용자가 선택한 텍스트가 이탤릭채로 변경
        break
      case 'format_underlined' : 
        changeTextFormat('underline') // 사용자가 선택한 텍스트가 언더라인으로 변경
        break
      case 'format_strikethrough' : 
        changeTextFormat('strikethrough') // 사용자가 선택한 텍스트가 strikethrough으로 변경
        break
      case 'format_color_text' : 
        // changeTextFormat('foreColor', 'orange') // 사용자가 선택한 텍스트 foreColor 변경
        hideDropdown(toolBox, 'format_color_text')
        colorBoxes[0].classList.toggle('show')
        break   
      case 'format_color_fill' : 
        // changeTextFormat('backColor', 'black') // 사용자가 선택한 텍스트 backColor 변경
        hideDropdown(toolBox, 'format_color_fill')
        colorBoxes[1].classList.toggle('show')
        break      
      case 'format_size' : 
        // changeTextFormat('fontSize', '7') // 사용자가 선택한 텍스트 fontSize 변경
        hideDropdown(toolBox, 'format_size')
        fontBox.classList.toggle('show')
        break    
    }
  })
  colorBoxes[0].addEventListener('click', (event) => changeColor(event, 'foreground')) 
  colorBoxes[1].addEventListener('click', (event) => changeColor(event, 'background'))
  fontBox.addEventListener('click', changeFontSize)
  // 텍스트 정렬
  const alignTool = document.querySelector('.align-tool')
  alignTool.addEventListener('click', function(event){
    console.log(event.target.innerText)
    switch(event.target.innerText){
      case 'format_align_left' :
        changeTextFormat('justifyLeft')
        break
      case 'format_align_center' :
        changeTextFormat('justifyCenter')
        break  
      case 'format_align_right' :
        changeTextFormat('justifyRight')
        break 
      case 'format_align_justify' :
        changeTextFormat('justifyFull')
        break 
    }
  })
  // 부가기능 
  const linkTool = document.querySelector('.link-tool')
  const imoticonBox = document.querySelector('.link-tool .imoticon-box')
  linkTool.addEventListener('click', function(event){
    event.stopPropagation()
    event.preventDefault()
    console.log(event.target.innerText)
    switch(event.target.innerText){
      case 'sentiment_satisfied' :
        hideDropdown(toolBox, 'sentiment_satisfied')
        imoticonBox.classList.toggle('show')
        break
      case 'table_view' :
        break
      case 'link' :
        break
      case 'format_list_bulleted' :
        break
    }
  })
imoticonBox.addEventListener('click', addImoticon)
})



// 공백라인 (공백 엘리먼트) 생성
function createNewLine(){
  const newline = document.createElement('div')
  newline.innerHTML = '<br>'
  return newline
}
function addFileToCurrentLine(line, file){
  console.log(line.nodeType) // nodeType = 3이면 텍스트 노드
  if(line.nodeType === 3){
    line = line.parentNode // div엘리먼트
  }
  line.insertAdjacentElement('afterend', createNewLine())
  line.nextSibling.insertAdjacentElement('afterbegin', file)
  line.nextSibling.insertAdjacentElement('afterend', createNewLine())
  return line.nextSibling.nextSibling // 파일 하단에 위치한 공백라인
}
function getFileName(name, limit){
  console.log(name.slice(0, limit))
  console.log(name.lastIndexOf('.'), name.length)
  return name.length > limit ? 
  `${name.slice(0, limit)}...${name.slice(name.lastIndexOf('.'), name.length)}`
  : name
}
// number : 파일용량(Bytes)
function getFileSize(number){
  if(number < 1024){
    return number + 'bytes'
  } else if(number >= 1024 && number < 1048576){
    return (number / 1024).toFixed(1) + 'KB' // toFiexd(1) : 소수 첫번째 자리에서 끊어준다
  } else if(number >= 1048576 ){
    return (number / 1048576).toFixed(1) + 'MB'
  }
}
// options : { className : 'audio', controls :'true' } 속성들을 객체로 집어넣음
function buildMediaElement(tag, options){
  const mediaElement = document.createElement(tag)
  for(const option in options){ // 생성한 엘리먼트에 속성 설정
    mediaElement[option] = options[option]  // for - in 문을 알아야한다
  }
  return mediaElement
}
function changeTextFormat(style, param){
  document.execCommand(style, false, param)
  postContents.focus({preventScroll: true})// 커서 설정
}
function hideDropdown(toolbox, currentDropdown){
  const dropdown = toolbox.querySelector('.select-menu-dropdown.show')

  console.log(currentDropdown) // 현재 클릭한 아이콘
  console.log(dropdown?.parentElement)
  // 현재 text-tool 요소 안쪽에서 열려있는 드롭다운 메뉴를 조회
  if(dropdown && dropdown.parentElement.querySelector('a span').innerText !== currentDropdown) 
  dropdown.classList.remove('show')
}
document.addEventListener('click', function(e){
  console.log(e.target)
  // 현재 열려있는 드롭다운 메뉴 조회
  const dropdown = document.querySelector('.select-menu-dropdown.show')
  if(dropdown && !dropdown.contains(e.target)){ // 현재 열려있는 드롭다운이 존재하고 현재 클릭한 곳이 드롭다운 메뉴가 아닌 경우
    dropdown.classList.remove('show')
  }
})
function changeColor(event, mode){
  event.stopPropagation() // 상위요소로 클릭이벤트가 버블링되지 않게함
  if(!event.target.classList.contains('select-menu-dropdown')){
    console.log(mode, event.target.style.backgroundColor)
    switch(mode){
      case 'foreground' :
        changeTextFormat('foreColor', event.target.style.backgroundColor)
        break
      case 'background' :
        changeTextFormat('backColor', event.target.style.backgroundColor)
        break
        
    }
    event.target.parentElement.classList.remove('show') //드롭다운 숨기기
  }
}
function changeFontSize(event){
  event.stopPropagation()
  if(!event.target.classList.contains('select-menu-dropdown')){
    changeTextFormat('fontSize', event.target.id) //폰트크기변경
    event.target.parentElement.classList.remove('show') //드롭다운 숨기기
  }
}
function addImoticon(event){
  event.stopPropagation()
  console.log(event.target.parentElement)
  if(!event.target.classList.contains('select-menu-dropdown')){
    changeTextFormat('insertText', event.target.innerText) // 아이콘 추가
    event.target.parentElement.classList.remove('show')
  }
}