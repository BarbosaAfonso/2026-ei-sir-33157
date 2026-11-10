<script>
  import { corCurso, FORMAS } from '../util.js';

  // Forma + cor identificam o curso. i < 0 = "sem curso"
  let { i, class: extra = '' } = $props();
</script>

<span
  aria-hidden="true"
  class="inline-block size-[11px] flex-none bg-(--c) {i < 0 ? 'rounded-[2px] opacity-70' : FORMAS[i % FORMAS.length]} {extra}"
  style="--c: {corCurso(i)}"
></span>
