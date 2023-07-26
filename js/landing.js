const scroller = new Scroller(false) // 스크롤 객체 생성


window.addEventListener('load', (event)=> {
  scroller.setScrollPosition({ top: 0, behavior: "smooth" })
  // 테마변경 (다크모드/일반모드)
  const mode = document.querySelector('.mode')
  const header = document.querySelector('header')
  const icons = mode.querySelectorAll('.fa-solid')

  mode.addEventListener('click',(event) => {
    document.body.classList.toggle('dark')
    header.classList.toggle('dark')

    for(const icon of icons){
      icon.classList.contains('active') ?
        icon.classList.remove('active') 
        : icon.classList.add('active')
    }
  })
  // 브라우저 상단으로 스크롤링하기
  // history.pushState() 메서드를 사용하면 url주소를 변경할수 있음, 리엑트(라우터)에서 페이지이동할때 자주쓰임

  const arrowUp = document.querySelector('.footer .icons .scroll-up')
  arrowUp.addEventListener('click', (event) => {
    history.pushState({}, '', '/') //URL주소 초기화, window.history를 window생략하고 표기
    scroller.setScrollPosition({top: 0, behavior : 'smooth'})
  })

  const logo = document.querySelector('header .logo')
  logo.addEventListener('click', (event) => {
    event.preventDefault() // a태그의 기본동작 제거, 여기서는 한번에 화면이 올라가는 것(부드럽지않게)을 제거함
    history.pushState({}, '', '/') //URL주소 초기화, window.history를 window생략하고 표기
    scroller.setScrollPosition({top: 0, behavior : 'smooth'})
  })

  // 네비게이션 메뉴 클릭시 해당 섹션으로 곧바로 스크롤하기
  const sections = document.querySelectorAll('section:not(.footer)')
  const nav = document.querySelector('.navbar ul')

  // 네비게이션 메뉴 클릭한 경우
  nav.querySelectorAll('li a').forEach(anchor => {
    anchor.addEventListener('click', function(event){
      const section = this.getAttribute('href')
      console.log(document.querySelector(section))
      const offsetToElementFromViewport = 
      document.querySelector(section).getBoundingClientRect().top // 브라우저 상단에서 엘리먼트까지의 거리

      if(!scroller.getScrollState()){
        event.preventDefault()
        history.pushState({}, '', `${section}`)

        const offsetToElementFromDocument = offsetToElementFromViewport + 
        scroller.getScrollPosition() // 문서 상단에서 section까지의 거리
        scroller.setScrollPosition({
          top: offsetToElementFromDocument - header.offsetHeight - 10,
          behavior: 'smooth'
        })
      }
    })
  })

  let lastScrollLocation = 0 // 최근 스크롤 위치 기억하기
  let sectionToMove, menulink 

  // 스크롤링중에 발생하는 이벤트
  window.addEventListener('scroll', (event) => {
    // 스크롤이 끝났는지 안끝났는지 체크하기
    scroller.isScrollended()
    .then(result => console.log('scroll ended!'))
    .catch(err => console.log('scrollung...'))

    // 스크롤릴중에 어느정도 스크롤바를 내리면 헤더에 그림자 적용
    scroller.getScrollPosition() > header.offsetHeight ? 
    header.classList.add('active')
    : header.classList.remove('active')

    // 스크롤링중에 텍스트 애니메이션 적용하기
    sections.forEach(section => {
      const title = section.querySelector('.content h3')
      const paragraph = section.querySelector('.content p')

      // console.log(section.id, section.getBoundingClientRect().top)

      if(section.getBoundingClientRect().top < header.offsetHeight + 50){
        // 해당 섹션이 헤더에 가까워지면 텍스트 애니메이션 적용하기
        title.classList.add('show')
        paragraph.classList.add('show')

        // 해당 섹션이 헤더에 가까워지면 해당 메뉴에 하이라이트 적용
        console.log(section.id)
        nav.querySelector('a.active').classList.remove('active')
        nav.querySelector(`a[href='#${section.id}']`).classList.add('active')
      }

      // 스크롤바가 브라우저 상단에 도달하면 텍스트 애니메이션 해제
      if(scroller.getScrollPosition() < 10){
        title.classList.remove('show')
        paragraph.classList.remove('show')
      }
    })
    if(!scroller.getScrollState()){ //조건문 안해주면 무한루프 발생함
      // 2. 현재 화면에 보여지는 섹션에 대한 메뉴의 링크(a 태그) 가져오기
      menulink = nav.querySelector('a.active').closest('li')

     // 1. 스크롤을 내렸는지 올렸는지 판단하기
     if(scroller.getScrollPosition() - lastScrollLocation > 10){
      lastScrollLocation = scroller.getScrollPosition()
      sectionToMove = menulink.nextElementSibling?.querySelector('a')

    }else if(lastScrollLocation - scroller.getScrollPosition() > 10){
      lastScrollLocation = scroller.getScrollPosition()
      sectionToMove = menulink.previousElementSibling?.querySelector('a')
    }

      // 스크롤링할때 이전/다음 메뉴를 자바스크립트로 클릭해주기
      if(sectionToMove?.getAttribute('href') !== undefined){ // 1번 메뉴 이전 섹션이 없고, 3번메뉴 다음 섹션이 없으므로 undefinded를 걸러는 조건문을 작성함
        sectionToMove.click()
      }
    }
  })

})
