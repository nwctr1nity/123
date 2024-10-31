document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("patientForm");
    const priceForm = document.getElementById("priceForm");
    const dailyCardsContainer = document.getElementById("dailyCards");
    const servicesListContainer = document.getElementById("servicesList");

    const lastServiceSelect = document.getElementById("lastService");
    const nextServiceSelect = document.getElementById("nextService");
    const lastQuantityInput = document.getElementById("lastQuantity");
    const nextQuantityInput = document.getElementById("nextQuantity");
    const lastTotalCostInput = document.getElementById("lastTotalCost");
    const nextTotalCostInput = document.getElementById("totalCost");

    let patientData = JSON.parse(localStorage.getItem("patients")) || [];
    let priceList = JSON.parse(localStorage.getItem("priceList")) || [];

    // Отображение прайс-листа услуг
    function displayPriceList() {
        servicesListContainer.innerHTML = "";
        lastServiceSelect.innerHTML = "<option value=''>Выберите услугу</option>";
        nextServiceSelect.innerHTML = "<option value=''>Выберите услугу</option>";

        priceList.forEach((service) => {
            const serviceOption = document.createElement("option");
            serviceOption.value = JSON.stringify(service);
            serviceOption.textContent = `${service.name} - ${service.cost}₽/ед.`;
            lastServiceSelect.appendChild(serviceOption.cloneNode(true));
            nextServiceSelect.appendChild(serviceOption);
        });
    }

    // Функция для обновления общей стоимости визита
    function updateTotalCost(select, quantityInput, totalCostInput) {
        const selectedService = JSON.parse(select.value || "{}");
        const quantity = parseInt(quantityInput.value) || 1;
        totalCostInput.value = selectedService.cost ? selectedService.cost * quantity : 0;
    }

    // Конвертация даты в формат "10 декабря 2024 года"
    function formatDateToWords(dateStr) {
        const date = new Date(dateStr);
        const months = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} года`;
    }

    // Добавление услуги в прайс-лист
    priceForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const newService = {
            name: document.getElementById("serviceName").value,
            cost: parseFloat(document.getElementById("serviceCost").value)
        };

        priceList.push(newService);
        localStorage.setItem("priceList", JSON.stringify(priceList));
        priceForm.reset();
        displayPriceList();
    });

    // Обновление стоимости визитов при изменении услуги или количества
    lastServiceSelect.addEventListener("change", () => updateTotalCost(lastServiceSelect, lastQuantityInput, lastTotalCostInput));
    lastQuantityInput.addEventListener("input", () => updateTotalCost(lastServiceSelect, lastQuantityInput, lastTotalCostInput));
    nextServiceSelect.addEventListener("change", () => updateTotalCost(nextServiceSelect, nextQuantityInput, nextTotalCostInput));
    nextQuantityInput.addEventListener("input", () => updateTotalCost(nextServiceSelect, nextQuantityInput, nextTotalCostInput));

    // Отображение всех карточек пациентов
    function displayPatients() {
        dailyCardsContainer.innerHTML = "";

        const groupedByDate = patientData.reduce((acc, patient) => {
            const date = patient.nextVisitDate;
            acc[date] = acc[date] || [];
            acc[date].push(patient);
            return acc;
        }, {});

        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

        sortedDates.forEach(date => {
            const dayCard = document.createElement("div");
            dayCard.classList.add("day-card");
            dayCard.innerHTML = `<h3>${formatDateToWords(date)}</h3>`;

            groupedByDate[date].sort((a, b) => a.nextVisitTime.localeCompare(b.nextVisitTime));

            groupedByDate[date].forEach(patient => {
                const patientCard = document.createElement("div");
                patientCard.classList.add("patient-card");
                patientCard.innerHTML = `
                    <div>
                        <strong>${patient.patientName}</strong><br>
                        <strong>Последний визит:</strong><br>
                        Услуга: ${patient.lastService.name}<br>
                        Количество: ${patient.lastQuantity} ед.<br>
                        Общая стоимость: ${patient.lastTotalCost}₽<br><br>
                        
                        <strong>Следующий визит:</strong><br>
                        Время: ${patient.nextVisitTime}<br>
                        Услуга: ${patient.nextService.name}<br>
                        Количество: ${patient.nextQuantity} ед.<br>
                        Общая стоимость: ${patient.nextTotalCost}₽
                    </div>
                    <button class="delete-btn" data-id="${patient.id}">Удалить</button>
                `;
                dayCard.appendChild(patientCard);
            });
            dailyCardsContainer.appendChild(dayCard);
        });
    }

    // Добавление пациента
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedLastService = JSON.parse(lastServiceSelect.value);
        const selectedNextService = JSON.parse(nextServiceSelect.value);
        const lastQuantity = parseInt(lastQuantityInput.value);
        const nextQuantity = parseInt(nextQuantityInput.value);

        const newPatient = {
            id: Date.now().toString(),
            patientName: document.getElementById("patientName").value,
            lastVisitDate: document.getElementById("lastVisitDate").value,
            lastService: selectedLastService,
            lastQuantity: lastQuantity,
            lastTotalCost: selectedLastService.cost * lastQuantity,
            nextVisitDate: document.getElementById("nextVisitDate").value,
            nextVisitTime: document.getElementById("nextVisitTime").value,
            nextService: selectedNextService,
            nextQuantity: nextQuantity,
            nextTotalCost: selectedNextService.cost * nextQuantity
        };

        patientData.push(newPatient);
        localStorage.setItem("patients", JSON.stringify(patientData));

        form.reset();
        lastTotalCostInput.value = "";
        nextTotalCostInput.value = "";
        displayPatients();
    });

    // Удаление карточки пациента
    dailyCardsContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id;
            patientData = patientData.filter(patient => patient.id !== id);
            localStorage.setItem("patients", JSON.stringify(patientData));
            displayPatients();
        }
    });

    displayPriceList();
    displayPatients();
});
