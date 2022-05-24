import { useEffect, useState } from 'react';
import { getJSDocDeprecatedTag } from 'typescript';
import me from '../../me.jpg'
import './card.css'

const Card = () => {
    const birthDate = new Date(1992 + 1970, 2, 5);
    const getAge = () => new Date(Date.now() - birthDate.getTime());

    const [age, setAge] = useState(getAge())

    useEffect(() => {
        const interval = setInterval(() => { setAge(getAge()) }, 500);
        return () => clearInterval(interval);
    }, []);


    return (
        <div className='card'>
            <div className="title">Nikita Zenkov</div>
            <div className="photo">
                <img src={me} alt='' />
            </div>
            <div className="profession">.Net developer</div>
            <div className="bio"> I am {age.getFullYear()}y {age.getMonth()}m {age.getDate()}d old</div>
            <div className="contact">
                <a href='https://twitter.com/cm4ker'><i className='fa fa-twitter'></i></a>
                <a href="https://t.me/cm4ker"><i className='fa fa-telegram'></i></a>
                <a href="mailto:cm4ker@gmail.com"><i className="fa fa-envelope"></i></a>
                <a href="https://github.com/cm4ker"><i className="fa fa-github"></i></a>
            </div>
        </div>
    );
}

export default Card;