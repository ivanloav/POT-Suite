# 🚦 Manual Stormshield SN510 – Publicar aplicación Docker (GesPack)

---

## 1. Crea los objetos de red

### a) Crea el objeto IP del servidor Ubuntu

1. Ve a **Configuration > Objects > Network**.
2. Haz clic en **+ Add**.
3. **Type:** Host
4. **Name:** GesPack\_Ubuntu (o como prefieras)
5. **Address:** *Pon la IP interna de tu Ubuntu, ej: 192.168.1.100*
6. **Save**.

### b) (Opcional) Crea objetos para los puertos (si no existen)

* **HTTP (80/TCP) y HTTPS (443/TCP) ya existen**, pero puedes crear uno nuevo si quieres filtrar por nombre:

  * **Name:** gespack\_http (80/TCP)
  * **Name:** gespack\_https (443/TCP)

---

## 2. Crea la regla de filtrado (firewall)

1. Ve a **Configuration > Security Policy > Filter - NAT**.
2. Elige la **Policy** adecuada (probablemente “Default Policy” o la que use tu WAN principal).
3. Haz clic en **+ Add a rule** (arriba o abajo de la WMS si quieres orden).
4. Completa así:

   * **Source Interface:** Internet (o Any)
   * **Destination Interface:** Tu LAN (donde está el Ubuntu)
   * **Source:** Any (o como prefieras limitar)
   * **Destination:** GesPack\_Ubuntu (objeto creado antes)
   * **Service:** http, https
   * **Action:** pass
   * **Enable IPS/Logging** si lo necesitas.
5. **Save**.

---

## 3. Crea la regla NAT (redirección de puertos)

1. Sigue en **Configuration > Security Policy > Filter - NAT**.
2. Haz clic en **+ Add a NAT rule**.
3. Completa así:

   * **Source Interface:** Internet
   * **Destination Interface:** Tu interfaz pública
   * **Original Destination:** *Tu IP pública externa (195.55.109.2)*
   * **Translated Destination:** *El objeto GesPack\_Ubuntu (192.168.1.100, tu IP interna)*
   * **Service:** http, https (o el/los servicios que expongas)
   * **NAT Type:** Static NAT (Destination NAT)
   * **Enable logging** si quieres auditoría
4. **Guarda los cambios**.

---

## 4. Ordena las reglas

* Las reglas **NAT y de filtrado deben estar activas (ON) y en el orden adecuado** (por encima de reglas de denegación global).
* Comprueba que no haya una regla previa bloqueando el tráfico.

---

## 5. Aplica la configuración

* Haz clic en **Apply Configuration** (arriba a la derecha).

---

## 6. Comprueba el acceso externo

* Desde fuera de la empresa, accede a:
  `http://gespack.parcelontime.es`
  `https://gespack.parcelontime.es`
* Si no va, revisa logs y que la IP interna y los puertos en el objeto y las reglas sean correctos.

---

## 7. ¿Más servicios/subdominios?

* Repite estos pasos para cada app/contenedor cambiando **puertos** (ej: pgadmin → 5050), creando objetos y reglas para cada servicio.

---

## 8. (Opcional) Configura HTTPS/Let’s Encrypt en el servidor

* Así tendrás web segura, sin advertencias, ¡y con la cadena completa!

---

# Resumen visual

* Crea objeto IP interna ➜
* Crea regla de filtrado (permite tráfico a IP interna y puertos) ➜
* Crea regla NAT (redirecciona 80/443 de la IP pública a tu IP interna) ➜
* Aplica cambios ➜
* Comprueba acceso externo
