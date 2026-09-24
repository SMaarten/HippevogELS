// Hippe vogELS — mandje, filters en bestellen
(function () {
  "use strict";
  var W = window.WINKEL || {};
  var BASE = document.body.getAttribute("data-base") || "";
  var SLEUTEL = "hippevogels-mandje";

  // ---------- Mandje-opslag ----------
  function lees() {
    try { return JSON.parse(localStorage.getItem(SLEUTEL)) || []; } catch (e) { return []; }
  }
  function bewaar(items) {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(items)); } catch (e) {}
    teller();
  }
  function teller() {
    var n = lees().length;
    document.querySelectorAll("[data-teller]").forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }
  function euro(b) {
    b = Number(b) || 0;
    return "€ " + (b % 1 === 0 ? String(b) : b.toFixed(2).replace(".", ","));
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- Toevoegen ----------
  document.querySelectorAll("[data-toevoegen]").forEach(function (knop) {
    var id = knop.dataset.id;
    function alToegevoegd() {
      knop.textContent = "In je mandje ✓ — bekijk mandje";
      knop.classList.add("is-toegevoegd");
    }
    if (lees().some(function (i) { return i.id === id; })) alToegevoegd();
    knop.addEventListener("click", function () {
      var items = lees();
      if (items.some(function (i) { return i.id === id; })) {
        location.href = BASE + "/mandje/";
        return;
      }
      items.push({
        id: id, titel: knop.dataset.titel, prijs: Number(knop.dataset.prijs),
        foto: knop.dataset.foto, url: knop.dataset.url
      });
      bewaar(items);
      alToegevoegd();
    });
  });

  // ---------- Galerij ----------
  var hoofd = document.getElementById("hoofdfoto");
  document.querySelectorAll(".duim").forEach(function (d) {
    d.addEventListener("click", function () {
      hoofd.src = d.dataset.foto;
      document.querySelectorAll(".duim").forEach(function (x) { x.classList.toggle("is-actief", x === d); });
    });
  });

  // ---------- Filters ----------
  var raster = document.querySelector("[data-raster]");
  if (raster) {
    var actief = "alles";
    var enkelTeKoop = document.querySelector("[data-alleen-te-koop]");
    function filter() {
      var zichtbaar = 0;
      raster.querySelectorAll(".kaart").forEach(function (k) {
        var ok = (actief === "alles" || k.dataset.categorie === actief) &&
          !(enkelTeKoop && enkelTeKoop.checked && k.dataset.status === "verkocht");
        k.hidden = !ok;
        if (ok) zichtbaar++;
      });
      document.querySelector("[data-leeg]").hidden = zichtbaar > 0;
    }
    document.querySelectorAll("[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        actief = chip.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach(function (c) { c.classList.toggle("is-actief", c === chip); });
        filter();
      });
    });
    if (enkelTeKoop) enkelTeKoop.addEventListener("change", filter);
  }

  // ---------- Mandje-pagina ----------
  var pagina = document.querySelector("[data-mandje-pagina]");
  if (pagina) mandjePagina();

  function mandjePagina() {
    var inhoud = pagina.querySelector("[data-mandje-inhoud]");
    var form = pagina.querySelector("[data-bestelformulier]");
    var bedankt = pagina.querySelector("[data-bedankt]");
    var stand = {};

    fetch(BASE + "/producten.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) { stand = d; })
      .catch(function () {})
      .then(teken);

    function beschikbaar(i) {
      var p = stand[i.id];
      return !p || p.status === "beschikbaar";
    }
    function levering() {
      var r = form.querySelector("input[name=levering]:checked");
      return r ? r.value : "verzenden";
    }
    function bedragen(items) {
      var sub = items.reduce(function (s, i) { return s + (stand[i.id] ? stand[i.id].prijs : i.prijs); }, 0);
      var gratis = Number(W.gratis_verzending_vanaf) || 0;
      var verzend = levering() === "afhalen" || (gratis > 0 && sub >= gratis) ? 0 : Number(W.verzendkosten) || 0;
      return { sub: sub, verzend: verzend, totaal: sub + verzend };
    }

    function teken() {
      var items = lees();
      if (!items.length) {
        inhoud.innerHTML = '<p class="leeg">Je mandje is nog leeg.</p><p><a class="knop" href="' + BASE + '/winkel/">Naar de winkel</a></p>';
        form.hidden = true;
        return;
      }
      var weg = items.filter(function (i) { return !beschikbaar(i); });
      var ok = items.filter(beschikbaar);
      var b = bedragen(ok);
      inhoud.innerHTML =
        (weg.length ? '<p class="melding melding-verkocht">Jammer: ' + weg.map(function (i) { return "<strong>" + esc(i.titel) + "</strong>"; }).join(", ") +
          (weg.length > 1 ? " zijn" : " is") + ' intussen verkocht en wordt niet meegeteld.</p>' : "") +
        '<ul class="mandje-lijst">' + items.map(function (i) {
          var isWeg = !beschikbaar(i);
          return '<li class="mandje-item' + (isWeg ? " is-weg" : "") + '"><img src="' + esc(i.foto) + '" alt="">' +
            '<a href="' + esc(i.url) + '">' + esc(i.titel) + "</a>" +
            "<span>" + (isWeg ? "Verkocht" : euro(stand[i.id] ? stand[i.id].prijs : i.prijs)) + "</span>" +
            '<button type="button" class="weg-knop" data-weg="' + esc(i.id) + '">Verwijder</button></li>';
        }).join("") + "</ul>" +
        '<div class="totalen"><div><span>Subtotaal</span><span>' + euro(b.sub) + "</span></div>" +
        "<div><span>" + (levering() === "afhalen" ? "Afhalen" : "Verzending") + "</span><span>" + (b.verzend ? euro(b.verzend) : "gratis") + "</span></div>" +
        '<div class="totaal"><span>Totaal</span><span>' + euro(b.totaal) + "</span></div></div>";
      inhoud.querySelectorAll("[data-weg]").forEach(function (k) {
        k.addEventListener("click", function () {
          bewaar(lees().filter(function (i) { return i.id !== k.dataset.weg; }));
          teken();
        });
      });
      form.hidden = ok.length === 0;
    }

    function adresTonen() {
      var verzenden = levering() === "verzenden";
      var adres = form.querySelector("[data-adres]");
      adres.hidden = !verzenden;
      adres.querySelectorAll("input").forEach(function (i) { i.required = verzenden; });
    }
    form.querySelectorAll("input[name=levering]").forEach(function (r) {
      r.addEventListener("change", function () { adresTonen(); teken(); });
    });
    adresTonen();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fout = form.querySelector("[data-fout]");
      fout.hidden = true;
      var items = lees().filter(beschikbaar);
      if (!items.length) return;
      var f = new FormData(form);
      var b = bedragen(items);
      var ref = "HV-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      var regels = [
        "Bestelling " + ref, "",
        items.map(function (i) { return "- " + i.titel + " (" + euro(stand[i.id] ? stand[i.id].prijs : i.prijs) + ")"; }).join("\n"),
        "", "Subtotaal: " + euro(b.sub),
        (levering() === "afhalen" ? "Afhalen" : "Verzending: " + (b.verzend ? euro(b.verzend) : "gratis")),
        "Totaal: " + euro(b.totaal), "",
        "Naam: " + f.get("naam"), "E-mail: " + f.get("email"),
        f.get("telefoon") ? "Telefoon: " + f.get("telefoon") : "",
        levering() === "verzenden" ? "Adres: " + f.get("straat") + ", " + f.get("postcode") + " " + f.get("gemeente") : "",
        f.get("opmerking") ? "Opmerking: " + f.get("opmerking") : ""
      ].filter(function (x, idx, arr) { return x !== "" || arr[idx - 1] !== ""; }).join("\n");

      var knop = form.querySelector("button[type=submit]");
      knop.disabled = true;
      knop.textContent = "Bezig met versturen…";

      function klaar(viaMail) {
        bewaar([]);
        inhoud.innerHTML = "";
        form.hidden = true;
        bedankt.hidden = false;
        bedankt.innerHTML =
          "<h2>Bedankt, " + esc(f.get("naam")) + "!</h2>" +
          (viaMail
            ? "<p>Je e-mailprogramma opent met je bestelling. <strong>Vergeet niet op verzenden te klikken.</strong> Opende er niets? Mail je bestelling dan naar <a href=\"mailto:" + esc(W.email) + "\">" + esc(W.email) + "</a> met referentie <strong>" + ref + "</strong>.</p>"
            : "<p>Je bestelling <strong>" + ref + "</strong> is goed ontvangen.</p>") +
          "<p>Els bevestigt zo snel mogelijk dat je juweel nog beschikbaar is" +
          (W.iban ? " en je kan betalen via overschrijving: <strong>" + euro(b.totaal) + "</strong> op <strong>" + esc(W.iban) + "</strong> (" + esc(W.rekeninghouder || "") + ") met mededeling <strong>" + ref + "</strong>." : ", samen met de betaalgegevens.") +
          "</p>";
        bedankt.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (W.formspree_id) {
        fetch("https://formspree.io/f/" + encodeURIComponent(W.formspree_id), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ _subject: "Nieuwe bestelling " + ref, email: f.get("email"), bestelling: regels })
        }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          klaar(false);
        }).catch(function () {
          knop.disabled = false;
          knop.textContent = "Bestelling versturen";
          fout.hidden = false;
          fout.textContent = "Versturen lukte niet. Probeer opnieuw of mail naar " + W.email + ".";
        });
      } else {
        location.href = "mailto:" + W.email + "?subject=" + encodeURIComponent("Bestelling " + ref) + "&body=" + encodeURIComponent(regels);
        klaar(true);
      }
    });
  }

  teller();
})();
