document.addEventListener("DOMContentLoaded",
        () => {
            const e = document.getElementById("searchForm");
            e && e.addEventListener("submit", function (t) {
                t.preventDefault();
                const n = this.querySelector("input[type='text']").value,
                    c = this.querySelector("input[type='date']").value,
                    r = this.querySelector("select").value; alert(`Search Submitted!\nDestination: ${n}\nDate: ${c}\nGuests: ${r}`)
            });
            const t = document.getElementById("menu-toggle"),
                n = document.getElementById("nav-links"); t && n && (t.addEventListener("click", () => {
                    t.classList.toggle("active"),
                    n.classList.toggle("active")
                }),
                    document.querySelectorAll("#nav-links a").forEach(e => {
                        e.addEventListener("click",
                            () => { window.innerWidth <= 768 && (t.classList.remove("active"), n.classList.remove("active")) })
                    })),
                    document.querySelectorAll(".card button").forEach(e => {
                        e.addEventListener("click",
                            () => {
                                const t = e.parentElement, n = t.querySelector("h3")?.innerText || "", c = t.querySelectorAll("p"), r = c[0]?.innerText,
                                a = c[1]?.innerText; alert(`Tour Selected:\n${n}\nDuration: ${r}\nPrice: ${a}`)
                            })
                    })
        });