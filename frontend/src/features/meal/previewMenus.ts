import type { Menu } from './mealStore'

// Offline preview of backend data.sql. These IDs are never sent to the API.
export const previewMenus: Menu[] = [
  {
    "id": "preview-kimchi-jjigae",
    "name": "김치찌개",
    "image": "/images/menus/kimchi-jjigae.jpg",
    "categories": [
      "KOREAN",
      "한식"
    ]
  },
  {
    "id": "preview-doenjang-jjigae",
    "name": "된장찌개",
    "image": "/images/menus/doenjang-jjigae.jpg",
    "categories": [
      "KOREAN",
      "한식"
    ]
  },
  {
    "id": "preview-jeyuk-bokkeum",
    "name": "제육볶음",
    "image": "/images/menus/jeyuk-bokkeum.jpg",
    "categories": [
      "KOREAN",
      "한식"
    ]
  },
  {
    "id": "preview-bibimbap",
    "name": "비빔밥",
    "image": "/images/menus/bibimbap.jpg",
    "categories": [
      "KOREAN",
      "한식"
    ]
  },
  {
    "id": "preview-bulgogi",
    "name": "불고기",
    "image": "/images/menus/bulgogi.jpg",
    "categories": [
      "KOREAN",
      "한식"
    ]
  },
  {
    "id": "preview-gukbap",
    "name": "국밥",
    "image": "/images/menus/gukbap.jpg",
    "categories": [
      "KOREAN",
      "한식"
    ]
  },
  {
    "id": "preview-jjajangmyeon",
    "name": "짜장면",
    "image": "/images/menus/jjajangmyeon.jpg",
    "categories": [
      "CHINESE",
      "중식"
    ]
  },
  {
    "id": "preview-jjamppong",
    "name": "짬뽕",
    "image": "/images/menus/jjamppong.jpg",
    "categories": [
      "CHINESE",
      "중식"
    ]
  },
  {
    "id": "preview-bokkeumbap",
    "name": "볶음밥",
    "image": "/images/menus/bokkeumbap.jpg",
    "categories": [
      "CHINESE",
      "중식"
    ]
  },
  {
    "id": "preview-maratang",
    "name": "마라탕",
    "image": "/images/menus/maratang.jpg",
    "categories": [
      "CHINESE",
      "중식"
    ]
  },
  {
    "id": "preview-tangsuyuk",
    "name": "탕수육",
    "image": "/images/menus/tangsuyuk.jpg",
    "categories": [
      "CHINESE",
      "중식"
    ]
  },
  {
    "id": "preview-mapo-tofu",
    "name": "마파두부",
    "image": "/images/menus/mapo-tofu.jpg",
    "categories": [
      "CHINESE",
      "중식"
    ]
  },
  {
    "id": "preview-chobap",
    "name": "초밥",
    "image": "/images/menus/chobap.jpg",
    "categories": [
      "JAPANESE",
      "일식"
    ]
  },
  {
    "id": "preview-ramen",
    "name": "라멘",
    "image": "/images/menus/ramen.jpg",
    "categories": [
      "JAPANESE",
      "일식"
    ]
  },
  {
    "id": "preview-donkatsu",
    "name": "돈카츠",
    "image": "/images/menus/donkatsu.jpg",
    "categories": [
      "JAPANESE",
      "일식"
    ]
  },
  {
    "id": "preview-udon",
    "name": "우동",
    "image": "/images/menus/udon.jpg",
    "categories": [
      "JAPANESE",
      "일식"
    ]
  },
  {
    "id": "preview-gyudon",
    "name": "규동",
    "image": "/images/menus/gyudon.jpg",
    "categories": [
      "JAPANESE",
      "일식"
    ]
  },
  {
    "id": "preview-deopbap",
    "name": "덮밥",
    "image": "/images/menus/deopbap.jpg",
    "categories": [
      "JAPANESE",
      "일식"
    ]
  },
  {
    "id": "preview-cake",
    "name": "케이크",
    "image": "/images/menus/cake.jpg",
    "categories": [
      "CAFE_DESSERT",
      "카페,디저트"
    ]
  },
  {
    "id": "preview-waffle",
    "name": "와플",
    "image": "/images/menus/waffle.jpg",
    "categories": [
      "CAFE_DESSERT",
      "카페,디저트"
    ]
  },
  {
    "id": "preview-croffle",
    "name": "크로플",
    "image": "/images/menus/croffle.jpg",
    "categories": [
      "CAFE_DESSERT",
      "카페,디저트"
    ]
  },
  {
    "id": "preview-bingsu",
    "name": "빙수",
    "image": "/images/menus/bingsu.jpg",
    "categories": [
      "CAFE_DESSERT",
      "카페,디저트"
    ]
  },
  {
    "id": "preview-sandwich",
    "name": "샌드위치",
    "image": "/images/menus/sandwich.jpg",
    "categories": [
      "CAFE_DESSERT",
      "카페,디저트"
    ]
  },
  {
    "id": "preview-churros",
    "name": "츄러스",
    "image": "/images/menus/churros.jpg",
    "categories": [
      "CAFE_DESSERT",
      "카페,디저트"
    ]
  },
  {
    "id": "preview-hamburger",
    "name": "햄버거",
    "image": "/images/menus/hamburger.jpg",
    "categories": [
      "FAST_FOOD",
      "패스트푸드"
    ]
  },
  {
    "id": "preview-pizza",
    "name": "피자",
    "image": "/images/menus/pizza.jpg",
    "categories": [
      "FAST_FOOD",
      "패스트푸드"
    ]
  },
  {
    "id": "preview-chicken",
    "name": "치킨",
    "image": "/images/menus/chicken.jpg",
    "categories": [
      "FAST_FOOD",
      "패스트푸드"
    ]
  },
  {
    "id": "preview-hotdog",
    "name": "핫도그",
    "image": "/images/menus/hotdog.jpg",
    "categories": [
      "FAST_FOOD",
      "패스트푸드"
    ]
  },
  {
    "id": "preview-poke",
    "name": "포케",
    "image": "/images/menus/poke.jpg",
    "categories": [
      "FAST_FOOD",
      "패스트푸드"
    ]
  },
  {
    "id": "preview-taco",
    "name": "타코",
    "image": "/images/menus/taco.jpg",
    "categories": [
      "FAST_FOOD",
      "패스트푸드"
    ]
  },
  {
    "id": "preview-tteokbokki",
    "name": "떡볶이",
    "image": "/images/menus/tteokbokki.jpg",
    "categories": [
      "BUNSIK",
      "분식"
    ]
  },
  {
    "id": "preview-gimbap",
    "name": "김밥",
    "image": "/images/menus/gimbap.jpg",
    "categories": [
      "BUNSIK",
      "분식"
    ]
  },
  {
    "id": "preview-sundae",
    "name": "순대",
    "image": "/images/menus/sundae.jpg",
    "categories": [
      "BUNSIK",
      "분식"
    ]
  },
  {
    "id": "preview-rabokki",
    "name": "라볶이",
    "image": "/images/menus/rabokki.jpg",
    "categories": [
      "BUNSIK",
      "분식"
    ]
  },
  {
    "id": "preview-twigim",
    "name": "튀김",
    "image": "/images/menus/twigim.jpg",
    "categories": [
      "BUNSIK",
      "분식"
    ]
  },
  {
    "id": "preview-jjolmyeon",
    "name": "쫄면",
    "image": "/images/menus/jjolmyeon.jpg",
    "categories": [
      "BUNSIK",
      "분식"
    ]
  }
]
