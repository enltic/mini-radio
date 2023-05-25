import { useEffect, useState, useReducer, useRef } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit'
import { getSongsData, formatLength, formatDate } from './utils.js'
import Icon from './components/Icon.jsx'
import SegmentedButtons from './components/SegmentedButtons.jsx'
import Card from './components/Card.jsx';
import Tag from './components/Tag.jsx';
import IconButton from './components/IconButton.jsx';
import Menu from './components/Menu.jsx';
import MenuItem, {MenuDivider} from './components/MenuItem.jsx';
import Checkbox from './components/Checkbox.jsx';
import { MdDesignServices, MdMic, MdPlayCircleOutline, MdSort, MdSchedule, MdCalendarMonth, MdSortByAlpha, MdSwapVert } from 'react-icons/md';
import './SongListSection.scss';

const songs = getSongsData();

export function SongListSection(props) {
	const [selectedTypes, setSelectedTypes] = useState(['standalone', 'collab']);
	const [sortCriteria, setSortCriteria] = useState('date');
	const [sortDirection, setSortDirection] = useState('asc');

	const filteredSongs = songs
		.filter((song) => selectedTypes.includes(song.type.toLowerCase()))
		.sort((a, b) => {
			return (() => {
				if (sortCriteria === 'date') {
					return b.releaseDate.getTime() - a.releaseDate.getTime();
				}
				if (sortCriteria === 'name') {
					return a.name.localeCompare(b.name)
				}
				if (sortCriteria === 'length') {
					return a.length - b.length;
				}
				return 0;
			})() * (sortDirection === 'asc' ? 1 : -1);
		});

	return (
		<div className="list-section">
			<div className="list-section-header">
				<SegmentedButtons
					className="song-type-filter"
					buttons={[
						{label: 'Standalone', value: 'standalone', selected: true},
						{label: 'Collab', value: 'collab', selected: true},
						{label: 'Short', value: 'short'},
					]}
					multiple={true}
					setSelected={setSelectedTypes}
				/>
				<SongFilter
					setSortCriteria={setSortCriteria}
					setSortDirection={setSortDirection}
				/>
			</div>
			<Flipper className="song-list" flipKey={JSON.stringify(filteredSongs)}>
				<div className="song-list-inner">
					{filteredSongs.map((song) => (
						<Flipped
							key={song.hash}
							flipId={song.hash}
							onAppear={(el, index) => {
								el.animate([
									{ opacity: 0 },
									{ opacity: 1 }
								], {
									duration: 150,
									easing: 'ease-out'
								}).onfinish = () => el.style = '';
							}}
							onExit={(el, index, removeElement) => {
								el.animate([
									{ opacity: 1 },
									{ opacity: 0 }
								], {
									duration: 150,
									easing: 'ease-out'
								}).onfinish = () => removeElement();
							}}
						>
							<div>
								<Song
									song={song}
								/>
							</div>
						</Flipped>
					))}
				</div>
			</Flipper>
		</div>
	)
}

function SongFilter(props) {
	const [open, setOpen] = useState(false);
	const openBtnRef = useRef(null);

	const [sortCriteria, setSortCriteria] = useState('date');
	useEffect(() => {
		props.setSortCriteria(sortCriteria);
	}, [sortCriteria]);

	const [sortDirection, setSortDirection] = useState('asc');
	useEffect(() => {
		props.setSortDirection(sortDirection);
	}, [sortDirection]);


	return (
		<>
			<IconButton
				ref={openBtnRef}
				className="song-filter-btn"
				title="Sort"
				type={open ? 'tonal' : 'outlined'}
				selected={open}
				onClick={(e) => {
					setOpen(!open);
				}}
			>
				<MdSort/>
			</IconButton>
			{
				<Menu
					className="song-filter-menu"
					anchorElement={openBtnRef?.current}
					anchorPosition="right top"
					open={open}
				>
					<MenuItem
						icon={<MdCalendarMonth/>}
						checkbox
						onChange={(e) => {
							setSortCriteria('date');
						}}
						checked={sortCriteria === 'date'}
					>
						Release Date
					</MenuItem>
					<MenuItem
						icon={<MdSchedule/>}
						checkbox
						onChange={(e) => {
							setSortCriteria('length');
						}}
						checked={sortCriteria === 'length'}
					>
						Length
					</MenuItem>
					<MenuItem
						icon={<MdSortByAlpha/>}
						checkbox
						onChange={(e) => {
							setSortCriteria('name');
						}}
						checked={sortCriteria === 'name'}
					>
						Name
					</MenuItem>
					<MenuDivider/>
					<MenuItem
						icon={<MdSwapVert/>}
						checkbox
						onChange={(e) => {
							if (sortDirection === 'asc') {
								setSortDirection('desc');
							} else {
								setSortDirection('asc');
							}
						}}
						checked={sortDirection === 'desc'}
					>
						Descending
					</MenuItem>
				</Menu>
			}
		</>
	)
}

function Song(props) {
	const onClick = (e) => {
		console.log('play', props.song);
	}

	return (
		<Card className="song">
			<div
				className="song-cover" 
				style={{
					backgroundImage: `url(${new URL(`./data/covers/${props.song.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')})`
				}}
			/>
			<div className="song-info">
				<div className="song-title">
					<div className='song-name'>{props.song.name}</div>
				</div>
				<div className="song-creators">
					<div className="song-artist">
						<MdDesignServices/>
						{props.song.artist.split(',').map((x) => x.trim()).join(', ')}
					</div>
					<div className="song-singer">
						<MdMic/>
						{props.song.singer.split(',').map((x) => x.trim()).join(', ')}
					</div>
				</div>
				<div className="song-metas">
					<Tag className="song-type">{props.song.type}</Tag>
					<div className="song-date">{formatDate(props.song.releaseDate)}</div>
					<div className="song-length">{formatLength(props.song.length)}</div>
				</div>
			</div>
			<div className="song-actions">
				{
					<IconButton
						label="Play"
						onClick={onClick}
					>
						<MdPlayCircleOutline/>
					</IconButton>
				}
			</div>
		</Card>
	)
}