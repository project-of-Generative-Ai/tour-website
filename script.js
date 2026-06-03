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
                    document.querySelectorAll(".card-back button").forEach(btn => {
                        btn.classList.add("btn-book-tour");
                        btn.addEventListener("click", () => {
                            const cardBack = btn.closest(".card-back");
                            const tourName = cardBack?.querySelector("h3")?.innerText?.trim() || "Pakistan Road Trip Package";
                            if (typeof window.openBookingModal === "function") {
                                window.openBookingModal(tourName);
                            } else {
                                alert("Booking is loading. Please refresh the page and try again.");
                            }
                        });
                    })
        });