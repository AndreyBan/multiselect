/**
 * Created by AndreyBan
 * in PhpStorm
 * 22.05.2024
 **/
function getSelectedValue(options) {
    const index = options.selectedIndex
    return options[index >= 0 ? index : 0]?.innerText
}

function getValueText (select) {
    const isMulti = select.hasAttribute('multiple')
    const countSelected = select.querySelectorAll('option:checked').length
    const options = select.options

    return !isMulti
        ? getSelectedValue(options)
        : countSelected
            ? `Выбрано ${ countSelected } из ${ options.length }`
            : 'Ничего не выбрано'
}
function createSelect(originalSelect, initClassName) {
    const prevEl = originalSelect.previousElementSibling
    const options = originalSelect.options
    const htmlOptions = getCustomOptions(options)
    const value = getValueText(originalSelect)
    const nameField = `<div class="c-select-field">
                             ${ value ?? '' }
                         </div>`
    let title = ''

    originalSelect.setAttribute('hidden', 'hidden')

    if (prevEl?.tagName === 'LABEL') {
        title = prevEl.innerText
        prevEl.setAttribute('hidden', 'hidden')
        prevEl.remove()
    }

    initClassName = initClassName.replace('.', '')

    const originalClassList = originalSelect.classList.value.replace(initClassName, '')
    const html = `<div class="c-select-wrap ${originalClassList}">
                                        <div class="c-select" data-c-select>
                                        ${ title ? '<p class="c-select-title"><b>' + title + '</b></p>' : '' }
                                            ${ nameField }
                                            <div class="c-select__drop-list-wrap">
                                                <ul class="c-select__drop-list">
                                                    ${ htmlOptions }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>`
    originalSelect.insertAdjacentHTML('afterend', html)

}

function getCustomOptions(options) {
    let htmlOptions = ''

    for (let i = 0; i < options.length; i++) {
        htmlOptions += `<li>
                                <label>
                                    <span>${ options[i].innerText }</span>
                                    <input type="checkbox" class="c-select__check" value="${ options[i].value }" ${ options[i].selected ? 'checked' : '' } hidden>
                                </label>
                            </li>`
    }

    return htmlOptions
}

function initSelect(element, options = {
    eventChange: false
}) {
    const selects = document.querySelectorAll(element)

    selects.forEach(el => createSelect(el, element))
    addEventsSelect(options.eventChange)

    const select = document.querySelectorAll('[data-c-select]')

    select.forEach(el => {
        const field = el.querySelector('.c-select-field')

        field.addEventListener('click', () => {
            select.forEach(item => {
                if (el !== item && item.classList.contains('drop')) {
                    item.classList.remove('drop')
                }
            })

            el.classList.toggle('drop')

            if (!el.classList.contains('drop')) {
                selects.forEach(el => el.dispatchEvent(new Event('change')))
            }
        })
    })

    document.addEventListener('click', e => {
        if (!e.target.closest('[data-c-select]')) {
            select.forEach(el => el.classList.remove('drop'))
            selects.forEach(el => el.dispatchEvent(new Event('change')))
        }
    })

    return {
        refresh: () => {
            refreshSelect(element)
            addEventsSelect(options.eventChange)
        }
    }
}

function addEventsSelect(multiChange = false) {
    document.querySelectorAll('[data-c-select]')
        .forEach(el => syncCheckOptions(el, multiChange))
}

function syncCheckOptions(el, multiChange) {
    const originalSelect = el.closest('.c-select-wrap').previousElementSibling
    const isMulti = originalSelect.hasAttribute('multiple')
    const checkBoxes = el.querySelectorAll('.c-select__check')
    const field = el.querySelector('.c-select-field')

    checkBoxes.forEach(check => {
        check.addEventListener('click', () => {
            const options = originalSelect.options

            if (!isMulti) {
                disableSiblingsCheck(checkBoxes, check)
            }

            selectedOptions(options, check, isMulti)
            field.innerText = getValueText(originalSelect)

            if (!isMulti) {
                originalSelect.dispatchEvent(new Event('change'))
                originalSelect.nextElementSibling
                    .querySelector('[data-c-select]')
                    .classList
                    .remove('drop')
            } else if (isMulti && multiChange) {
                originalSelect.dispatchEvent(new Event('change'))
            }
        })
    })
}

function selectedOptions(options, check, isMulti) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === check.value && check.checked) {
            options[i].setAttribute('selected', '')
        } else if ((isMulti && options[i].value === check.value && !check.checked) || !isMulti) {
            options[i].removeAttribute('selected')
        }
    }
}

function disableSiblingsCheck(checkBoxes, check) {
    checkBoxes.forEach(item => {
        if (item !== check) {
            item.removeAttribute('checked')
            item.checked = false
        }

        check.checked = true
    })
}

function refreshSelect(nameClass) {
    const select = document.querySelectorAll(nameClass)

    select.forEach(el => {
        const cSelect = el.nextElementSibling
        const list = cSelect.querySelector('.c-select__drop-list')
        const value = cSelect.querySelector('.c-select-field')

        value.innerText = getValueText(el)
        list.innerHTML = getCustomOptions(el.options)
    })
}
