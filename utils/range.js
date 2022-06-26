export default function range(start, end) {
    return Array(end - start).fill().map((_, idx) => start + idx)
  }