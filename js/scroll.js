class Scroller{
  #isScrolling // 스크롤 상태 (스크롤링중인지 아닌지 판단)
  #scrollEndTimer // 스크롤이 끝나면 동작하는 타이머

  constructor(isScrolling){ // 멤버변수 초기화
    this.#isScrolling = isScrolling
    this.#scrollEndTimer = null // 외부에서 세팅할 필요가 없어서 null로 설정
  }
  // 메서드 정의
  getScrollPosition(){  // 현재 스크롤 위치 조회
    return window.pageYOffset // window.scrollTop -> 이건 크로스 브라우징이 안됨
  }
  setScrollPosition(position){ // 해당 위치로 스크롤링
    window.scrollTo(position)
    this.#setScrollState(true)
  }
  getScrollState(){
    return this.#isScrolling
  }
  #setScrollState(state){ // 스크롤 상태 변경, state는 true나 false를 가짐
    this.#isScrolling = state 
  }
  isScrollended(){ // 스크롤링이 끝났음을 감지
    return new Promise((resolve, reject) => {
      clearTimeout(this.#scrollEndTimer)
      this.#scrollEndTimer = setTimeout(() => {
        // 스크롤이 끝난 상태
        this.#setScrollState(false)
        resolve()
      }, 100)
    })
  }
}

// 스크롤링중인 상태에서 사용자가 클릭을 통해 다시 스크롤링을 시도할 경우
// 스크롤이 되지 않도록 비활성화를 시켜야 한다, 이것을 위해서 isScrolling이 필요하다
/* isScrollended() 함수는 window.addEventListener('scroll', ()=>{
  isScrollended()  //여기 안에서 작동한다 스크롤링이 됐을때만 실행됨
}) */