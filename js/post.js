window.addEventListener("load", (event) => {
  // 테마변경 (다크모드/ 일반모드)
  const mode = document.querySelector('.mode')
  const icons = mode.querySelectorAll('.fa-solid')
  const header = document.querySelector('header')

  const title = document.querySelector('.post-container .post-title input')
  const postContents = document.querySelector('.post-container .post-contents')
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
  let lastCaretLine = null // Caret : 커서를 의미 (커서 위치의 엘리먼트)
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
          const img = document.createElement('img')
          img.src = URL.createObjectURL(file)  // 파일 임시경로 생성
          // 편집기의 마지막 커서 위치에 파일 추가 
         lastCaretLine = addFileToCurrentLine(lastCaretLine, img)
         
        }else if(fileType.includes('video')){
          // 편집기의 마지막 커서 위치에 파일 추가 
          console.log('video')
        }else if(fileType.includes('audio')){
          // 편집기의 마지막 커서 위치에 파일 추가 
          console.log('audio')
        }else{
          // 편집기의 마지막 커서 위치에 파일 추가 
          console.log('file')
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
