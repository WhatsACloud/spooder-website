import React, { useState, useEffect } from 'react'
import styles from './FileInsert.module'

import api from '../../../../services/api'

const errMsg = 'File provided is not valid. Please select an image file.'

function FileInsert() {
  return (
    <>
      <div>
        <input
          type='file'
          name='imageFile'
          onChange={async e => {
            switch (e.target.name) {
              case 'imageFile':
                const file = e.target.files[0]
                const split = file.name.split('.')
                const extension = split[split.length - 1]
                console.log(extension)
                if (!(['png', 'jpg', 'jpeg'].includes(extension))) throw Error(errMsg)
                const formData = new FormData() 
                formData.append('image', file)
                formData.append('type', 'background')

                const res = await api.post('images/set', formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                })
                console.log(res)
                break
              default:
                console.error('error in file insert')
            }
          }}
          >
        </input>
      </div>
    </>
  )
}
export { FileInsert }