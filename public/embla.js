const wrap = document.querySelectorAll(".embla");

if (wrap !== null) {
  const viewPort = Array.from(
    document.querySelectorAll(".simple_embla_viewport")
  );
  console.log(viewPort);
  viewPort.forEach((view) => {
    let embla = EmblaCarousel(view, {
      dragFree: true,
      containScroll: "trimSnaps",
      slidesToScroll: 2,
      skipSnaps: false,
    });

    const prevBtn = view.nextElementSibling;
    const nextBtn = view.nextElementSibling.nextElementSibling;

    const setupPrevNextBtns = (prevBtn, nextBtn, embla) => {
      prevBtn.addEventListener("click", embla.scrollPrev, false);
      nextBtn.addEventListener("click", embla.scrollNext, false);
    };
    setupPrevNextBtns(prevBtn, nextBtn, embla);
    const disablePrevNextBtns = (prevBtn, nextBtn, embla) => {
      return () => {
        if (embla.canScrollPrev()) prevBtn.removeAttribute("disabled");
        else prevBtn.setAttribute("disabled", "disabled");

        if (embla.canScrollNext()) nextBtn.removeAttribute("disabled");
        else nextBtn.setAttribute("disabled", "disabled");
      };
    };

    const disablePrevAndNextBtns = disablePrevNextBtns(prevBtn, nextBtn, embla);

    embla.on("select", disablePrevAndNextBtns);
    embla.on("init", disablePrevAndNextBtns);
  });
}
