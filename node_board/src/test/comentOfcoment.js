let comments = [
  {
    name: 'parent',
    depth: 1,
    parent: 'main',
    content: "부모입니다.",
    time: 1
  },
  {
    name: 'child1',
    depth: 2,
    parent: 'parent',
    content: "첫번째 자식입니다.",
    time: 2
  },
  {
    name: 'child2',
    depth: 2,
    parent: 'parent',
    content: "두번째 자식입니다.",
    time: 3
  },
  {
    name: 'child11',
    depth: 3,
    parent: 'child1',
    content: "첫번째 자식의 두번째 자식입니다.",
    time: 5
  },
  {
    name: 'child12',
    depth: 3,
    parent: 'child1',
    content: "첫번째 자식의 첫번째 자식입니다.",
    time: 4
  },
  {
    name: 'child121',
    depth: 4,
    parent: 'child12',
    content: "첫번째 자식의 첫번째 자식입니다.",
    time: 4
  },
  {
    name: 'child13',
    depth: 3,
    parent: 'child1',
    content: "첫번째 자식의 첫번째 자식입니다.",
    time: 6
  },
]

let result = [];

function comment(parent, depth) {
  comments.filter((v) => {
    if (v.depth === depth && v.parent === parent) {
      return v
    }
  }).forEach(v => {
    result.push(v);
    comment(v.name, v.depth + 1)
  })
}

comment('main', 1)

console.log(result);

console.log(result.sort((a, b) => {
  if (a.depth == b.depth) {
    return a.time - b.time
  } else { return 0 }
}))